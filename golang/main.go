package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"
)

// --- Structs and Interfaces ---

type Signer struct {
	Address string `json:"address"`
	Name    string `json:"name"`
	Active  bool   `json:"active"`
}

type Transaction struct {
	ID        int       `json:"id"`
	To        string    `json:"to"`
	Value     uint64    `json:"value"`
	Approvals []string  `json:"approvals"`
	Executed  bool      `json:"executed"`
	CreatedAt time.Time `json:"created_at"`
}

// Interface for anything that can be described
type Describable interface {
	Describe() string
}

func (s Signer) Describe() string {
	status := "inactive"
	if s.Active {
		status = "active"
	}
	return fmt.Sprintf("Signer %s (%s) [%s]", s.Name, s.Address, status)
}

func (t Transaction) Describe() string {
	return fmt.Sprintf("Tx #%d: send %d wei to %s (%d approvals, executed=%t)",
		t.ID, t.Value, t.To, len(t.Approvals), t.Executed)
}

// --- MultiSig Wallet ---

type MultiSigWallet struct {
	mu          sync.RWMutex
	Signers     []Signer      `json:"signers"`
	Threshold   int           `json:"threshold"`
	Transactions []Transaction `json:"transactions"`
	nextID      int
}

func NewMultiSigWallet(signers []Signer, threshold int) *MultiSigWallet {
	return &MultiSigWallet{
		Signers:      signers,
		Threshold:    threshold,
		Transactions: make([]Transaction, 0),
		nextID:       1,
	}
}

func (w *MultiSigWallet) SubmitTransaction(to string, value uint64) Transaction {
	w.mu.Lock()
	defer w.mu.Unlock()

	tx := Transaction{
		ID:        w.nextID,
		To:        to,
		Value:     value,
		Approvals: make([]string, 0),
		Executed:  false,
		CreatedAt: time.Now(),
	}
	w.nextID++
	w.Transactions = append(w.Transactions, tx)
	return tx
}

func (w *MultiSigWallet) Approve(txID int, signerAddr string) error {
	w.mu.Lock()
	defer w.mu.Unlock()

	// Verify signer exists and is active
	if !w.isActiveSigner(signerAddr) {
		return fmt.Errorf("address %s is not an active signer", signerAddr)
	}

	for i, tx := range w.Transactions {
		if tx.ID == txID {
			if tx.Executed {
				return fmt.Errorf("transaction %d already executed", txID)
			}
			// Check for duplicate approval
			for _, addr := range tx.Approvals {
				if addr == signerAddr {
					return fmt.Errorf("signer %s already approved tx %d", signerAddr, txID)
				}
			}
			w.Transactions[i].Approvals = append(w.Transactions[i].Approvals, signerAddr)

			// Auto-execute if threshold met
			if len(w.Transactions[i].Approvals) >= w.Threshold {
				w.Transactions[i].Executed = true
				log.Printf("Transaction %d executed! (threshold %d met)", txID, w.Threshold)
			}
			return nil
		}
	}
	return fmt.Errorf("transaction %d not found", txID)
}

func (w *MultiSigWallet) isActiveSigner(addr string) bool {
	for _, s := range w.Signers {
		if s.Address == addr && s.Active {
			return true
		}
	}
	return false
}

// --- Goroutines and Channels ---

func describeAll(items []Describable) <-chan string {
	ch := make(chan string)
	go func() {
		defer close(ch)
		for _, item := range items {
			ch <- item.Describe()
		}
	}()
	return ch
}

// --- Maps demo ---

func signersByAddress(signers []Signer) map[string]Signer {
	m := make(map[string]Signer, len(signers))
	for _, s := range signers {
		m[s.Address] = s
	}
	return m
}

// --- HTTP Server ---

func main() {
	signers := []Signer{
		{Address: "0xAlice", Name: "Alice", Active: true},
		{Address: "0xBob", Name: "Bob", Active: true},
		{Address: "0xCharlie", Name: "Charlie", Active: true},
	}

	wallet := NewMultiSigWallet(signers, 2)

	// Demo: submit and approve a transaction
	tx := wallet.SubmitTransaction("0xRecipient", 1000)
	_ = wallet.Approve(tx.ID, "0xAlice")

	// Demo: channels and goroutines
	items := []Describable{signers[0], signers[1], tx}
	for desc := range describeAll(items) {
		log.Println(desc)
	}

	// Demo: maps
	lookup := signersByAddress(signers)
	if bob, ok := lookup["0xBob"]; ok {
		log.Printf("Found signer: %s", bob.Describe())
	}

	// HTTP handlers
	mux := http.NewServeMux()

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		fmt.Fprint(w, "<h1>Multi-Sig Wallet (Go)</h1><p>Endpoints: /health, /signers, /transactions</p>")
	})

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok", "lang": "go"})
	})

	mux.HandleFunc("/signers", func(w http.ResponseWriter, r *http.Request) {
		wallet.mu.RLock()
		signers := append([]Signer(nil), wallet.Signers...)
		wallet.mu.RUnlock()
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(signers)
	})

	mux.HandleFunc("/transactions", func(w http.ResponseWriter, r *http.Request) {
		wallet.mu.RLock()
		defer wallet.mu.RUnlock()
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(wallet.Transactions)
	})

	log.Println("Go multi-sig server listening on http://127.0.0.1:8081")
	log.Fatal(http.ListenAndServe(":8081", mux))
}
