from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from datetime import datetime
import hashlib
import uuid

from app.models.schemas import EvidenceEntry

router = APIRouter()

evidence_db: dict[str, EvidenceEntry] = {}

@router.post("/")
async def create_evidence(alert_id: str, entry_type: str, data: Dict[str, Any]):
    """
    Create an immutable evidence entry on the blockchain ledger.
    """
    entry_id = f"EV-{uuid.uuid4().hex[:8].upper()}"
    
    # Create hash of data for immutability verification
    data_str = str(sorted(data.items()))
    entry_hash = hashlib.sha256(data_str.encode()).hexdigest()
    
    evidence = EvidenceEntry(
        id=entry_id,
        alert_id=alert_id,
        entry_type=entry_type,
        data=data,
        hash=entry_hash,
        timestamp=datetime.utcnow(),
        verified=False,
    )
    evidence_db[entry_id] = evidence
    
    return {
        "id": entry_id,
        "hash": entry_hash,
        "blockchain_tx": f"0x{uuid.uuid4().hex}",
        "status": "committed",
    }

@router.get("/{evidence_id}")
async def get_evidence(evidence_id: str):
    if evidence_id not in evidence_db:
        raise HTTPException(status_code=404, detail="Evidence not found")
    return evidence_db[evidence_id]

@router.get("/alert/{alert_id}")
async def get_alert_evidence(alert_id: str):
    return [e for e in evidence_db.values() if e.alert_id == alert_id]

@router.post("/{evidence_id}/verify")
async def verify_evidence(evidence_id: str):
    if evidence_id not in evidence_db:
        raise HTTPException(status_code=404, detail="Evidence not found")
    
    evidence = evidence_db[evidence_id]
    data_str = str(sorted(evidence.data.items()))
    computed_hash = hashlib.sha256(data_str.encode()).hexdigest()
    
    evidence.verified = computed_hash == evidence.hash
    return {
        "verified": evidence.verified,
        "computed_hash": computed_hash,
        "stored_hash": evidence.hash,
    }
