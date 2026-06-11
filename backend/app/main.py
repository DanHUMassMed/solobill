from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="SoloBill Local API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "solobill-api",
        "version": "0.1.0",
        "capabilities": {
            "write": False,
            "read": False
        }
    }


@app.post("/invoices")
def create_invoice(invoice: dict):
    return {
        "status": "received",
        "invoice": invoice
    }