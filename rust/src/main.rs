use std::collections::HashMap;
use std::fmt;
use std::io::{BufRead, BufReader, Write};
use std::net::TcpListener;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use std::time::SystemTime;

// --- Enums ---

#[derive(Debug, Clone, PartialEq)]
enum TxStatus {
    Pending,
    Executed,
    Rejected,
}

impl fmt::Display for TxStatus {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            TxStatus::Pending => write!(f, "pending"),
            TxStatus::Executed => write!(f, "executed"),
            TxStatus::Rejected => write!(f, "rejected"),
        }
    }
}

// --- Structs ---

#[derive(Debug, Clone)]
struct Signer {
    address: String,
    name: String,
    active: bool,
}

#[derive(Debug, Clone)]
struct Transaction {
    id: u64,
    to: String,
    value: u64,
    approvals: Vec<String>,
    status: TxStatus,
    created_at: SystemTime,
}

// --- Traits ---

trait Describable {
    fn describe(&self) -> String;
}

impl Describable for Signer {
    fn describe(&self) -> String {
        let status = if self.active { "active" } else { "inactive" };
        format!("Signer {} ({}) [{}]", self.name, self.address, status)
    }
}

impl Describable for Transaction {
    fn describe(&self) -> String {
        format!(
            "Tx #{}: send {} wei to {} ({} approvals, {})",
            self.id,
            self.value,
            self.to,
            self.approvals.len(),
            self.status
        )
    }
}

// --- MultiSig Wallet with impl blocks ---

struct MultiSigWallet {
    signers: Vec<Signer>,
    threshold: usize,
    transactions: Vec<Transaction>,
    next_id: u64,
}

#[derive(Debug)]
enum WalletError {
    NotASigner(String),
    TxNotFound(u64),
    AlreadyExecuted(u64),
    DuplicateApproval(String, u64),
}

impl fmt::Display for WalletError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            WalletError::NotASigner(addr) => write!(f, "{addr} is not an active signer"),
            WalletError::TxNotFound(id) => write!(f, "transaction {id} not found"),
            WalletError::AlreadyExecuted(id) => write!(f, "transaction {id} already executed"),
            WalletError::DuplicateApproval(addr, id) => {
                write!(f, "{addr} already approved tx {id}")
            }
        }
    }
}

impl MultiSigWallet {
    fn new(signers: Vec<Signer>, threshold: usize) -> Self {
        Self {
            signers,
            threshold,
            transactions: Vec::new(),
            next_id: 1,
        }
    }

    fn submit_transaction(&mut self, to: &str, value: u64) -> &Transaction {
        let tx = Transaction {
            id: self.next_id,
            to: to.to_string(),
            value,
            approvals: Vec::new(),
            status: TxStatus::Pending,
            created_at: SystemTime::now(),
        };
        self.next_id += 1;
        self.transactions.push(tx);
        self.transactions.last().unwrap()
    }

    fn approve(&mut self, tx_id: u64, signer_addr: &str) -> Result<(), WalletError> {
        // Ownership: borrow signers to check, then work with transactions
        if !self.is_active_signer(signer_addr) {
            return Err(WalletError::NotASigner(signer_addr.to_string()));
        }

        let threshold = self.threshold;
        let tx = self
            .transactions
            .iter_mut()
            .find(|tx| tx.id == tx_id)
            .ok_or(WalletError::TxNotFound(tx_id))?;

        if tx.status == TxStatus::Executed {
            return Err(WalletError::AlreadyExecuted(tx_id));
        }

        if tx.approvals.iter().any(|a| a == signer_addr) {
            return Err(WalletError::DuplicateApproval(
                signer_addr.to_string(),
                tx_id,
            ));
        }

        tx.approvals.push(signer_addr.to_string());

        // Pattern matching on threshold check
        match tx.approvals.len() >= threshold {
            true => {
                tx.status = TxStatus::Executed;
                println!("Transaction {} executed! (threshold {} met)", tx_id, threshold);
            }
            false => {
                println!(
                    "Transaction {} has {}/{} approvals",
                    tx_id,
                    tx.approvals.len(),
                    threshold
                );
            }
        }

        Ok(())
    }

    fn is_active_signer(&self, addr: &str) -> bool {
        self.signers.iter().any(|s| s.address == addr && s.active)
    }

    // Iterators and closures
    fn active_signer_names(&self) -> Vec<&str> {
        self.signers
            .iter()
            .filter(|s| s.active)
            .map(|s| s.name.as_str())
            .collect()
    }

    fn pending_transactions(&self) -> Vec<&Transaction> {
        self.transactions
            .iter()
            .filter(|tx| tx.status == TxStatus::Pending)
            .collect()
    }
}

// --- Maps demo ---

fn signers_by_address(signers: &[Signer]) -> HashMap<&str, &Signer> {
    signers.iter().map(|s| (s.address.as_str(), s)).collect()
}

// --- JSON helpers (no external deps) ---

fn signer_to_json(s: &Signer) -> String {
    format!(
        r#"{{"address":"{}","name":"{}","active":{}}}"#,
        s.address, s.name, s.active
    )
}

fn tx_to_json(tx: &Transaction) -> String {
    let approvals: Vec<String> = tx.approvals.iter().map(|a| format!(r#""{}""#, a)).collect();
    format!(
        r#"{{"id":{},"to":"{}","value":{},"approvals":[{}],"status":"{}"}}"#,
        tx.id,
        tx.to,
        tx.value,
        approvals.join(","),
        tx.status
    )
}

// --- HTTP Server ---

fn handle_request(path: &str, wallet: &Mutex<MultiSigWallet>) -> (String, String) {
    match path {
        "/" => (
            "200 OK".to_string(),
            "<h1>Multi-Sig Wallet (Rust)</h1><p>Endpoints: /health, /signers, /transactions</p>"
                .to_string(),
        ),
        "/health" => (
            "200 OK".to_string(),
            r#"{"status":"ok","lang":"rust"}"#.to_string(),
        ),
        "/signers" => {
            let w = wallet.lock().unwrap();
            let json: Vec<String> = w.signers.iter().map(|s| signer_to_json(s)).collect();
            ("200 OK".to_string(), format!("[{}]", json.join(",")))
        }
        "/transactions" => {
            let w = wallet.lock().unwrap();
            let json: Vec<String> = w.transactions.iter().map(|tx| tx_to_json(tx)).collect();
            ("200 OK".to_string(), format!("[{}]", json.join(",")))
        }
        _ => (
            "404 NOT FOUND".to_string(),
            r#"{"error":"not found"}"#.to_string(),
        ),
    }
}

fn main() {
    const MAX_ACTIVE_CONNECTIONS: usize = 128;
    const MAX_REQUEST_LINE: usize = 8192;

    let signers = vec![
        Signer {
            address: "0xAlice".to_string(),
            name: "Alice".to_string(),
            active: true,
        },
        Signer {
            address: "0xBob".to_string(),
            name: "Bob".to_string(),
            active: true,
        },
        Signer {
            address: "0xCharlie".to_string(),
            name: "Charlie".to_string(),
            active: true,
        },
    ];

    let wallet = MultiSigWallet::new(signers.clone(), 2);

    // Demo: describe all signers (trait objects, iterators)
    let describables: Vec<&dyn Describable> = signers.iter().map(|s| s as &dyn Describable).collect();
    for item in &describables {
        println!("{}", item.describe());
    }

    // Demo: HashMap lookup
    let lookup = signers_by_address(&signers);
    if let Some(bob) = lookup.get("0xBob") {
        println!("Found: {}", bob.describe());
    }

    // Demo: active signer names (iterators + closures)
    println!("Active signers: {:?}", wallet.active_signer_names());

    // Wrap in Arc<Mutex> for shared state
    let wallet = Arc::new(Mutex::new(wallet));

    // Submit and approve a demo transaction
    {
        let mut w = wallet.lock().unwrap();
        w.submit_transaction("0xRecipient", 1000);
        let _ = w.approve(1, "0xAlice");
    }

    let listener = TcpListener::bind("127.0.0.1:8080").expect("Failed to bind to port 8080");
    println!("\nRust multi-sig server listening on http://127.0.0.1:8080");

    let active_connections = Arc::new(AtomicUsize::new(0));

    for stream in listener.incoming() {
        match stream {
            Ok(mut stream) => {
                let wallet = Arc::clone(&wallet);
                let active_connections = Arc::clone(&active_connections);

                if active_connections.fetch_add(1, Ordering::SeqCst) >= MAX_ACTIVE_CONNECTIONS {
                    active_connections.fetch_sub(1, Ordering::SeqCst);
                    let response = "HTTP/1.1 503 Service Unavailable\r\nContent-Type: text/plain\r\nContent-Length: 19\r\n\r\nService Unavailable";
                    let _ = stream.write_all(response.as_bytes());
                    continue;
                }

                thread::spawn(move || {
                    struct ActiveConnectionGuard {
                        counter: Arc<AtomicUsize>,
                    }

                    impl Drop for ActiveConnectionGuard {
                        fn drop(&mut self) {
                            self.counter.fetch_sub(1, Ordering::SeqCst);
                        }
                    }

                    let _active_connection_guard = ActiveConnectionGuard {
                        counter: active_connections,
                    };

                    let _ = stream.set_read_timeout(Some(Duration::from_secs(5)));
                    let mut request_line = String::with_capacity(MAX_REQUEST_LINE + 2);
                    {
                        let mut reader = BufReader::new(&mut stream);
                        if reader.read_line(&mut request_line).is_err()
                            || request_line.len() > MAX_REQUEST_LINE
                        {
                            let response = "HTTP/1.1 414 Request-URI Too Long\r\nContent-Type: text/plain\r\nContent-Length: 16\r\n\r\nRequest Too Long";
                            let _ = stream.write_all(response.as_bytes());
                            return;
                        }
                    }

                    // Parse the path from "GET /path HTTP/1.1"
                    let path = request_line
                        .split_whitespace()
                        .nth(1)
                        .unwrap_or("/");

                    let (status, body) = handle_request(path, &wallet);

                    let content_type = if path == "/" { "text/html" } else { "application/json" };

                    let response = format!(
                        "HTTP/1.1 {status}\r\nContent-Type: {content_type}\r\nContent-Length: {}\r\n\r\n{body}",
                        body.len()
                    );

                    let _ = stream.write_all(response.as_bytes());
                });
            }
            Err(e) => eprintln!("Connection failed: {e}"),
        }
    }
}
