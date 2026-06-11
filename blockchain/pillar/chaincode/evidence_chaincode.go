package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// EvidenceEntry represents an immutable evidence record
type EvidenceEntry struct {
	ID            string                 `json:"id"`
	AlertID       string                 `json:"alert_id"`
	EntryType     string                 `json:"entry_type"`
	DataHash      string                 `json:"data_hash"`
	BlockchainTx  string                 `json:"blockchain_tx"`
	Timestamp     string                 `json:"timestamp"`
	Creator       string                 `json:"creator"`
	Verified      bool                   `json:"verified"`
	Metadata      map[string]interface{} `json:"metadata"`
}

// SmartContract provides functions for managing evidence
type SmartContract struct {
	contractapi.Contract
}

// CreateEvidence adds a new evidence entry to the ledger
func (s *SmartContract) CreateEvidence(ctx contractapi.TransactionContextInterface,
	id string, alertID string, entryType string, dataHash string, metadataJSON string) (*EvidenceEntry, error) {

	exists, err := s.EvidenceExists(ctx, id)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, fmt.Errorf("evidence %s already exists", id)
	}

	var metadata map[string]interface{}
	if err := json.Unmarshal([]byte(metadataJSON), &metadata); err != nil {
		return nil, fmt.Errorf("invalid metadata JSON: %v", err)
	}

	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return nil, err
	}

	event := EvidenceEntry{
		ID:           id,
		AlertID:      alertID,
		EntryType:    entryType,
		DataHash:     dataHash,
		BlockchainTx: ctx.GetStub().GetTxID(),
		Timestamp:    time.Now().UTC().Format(time.RFC3339),
		Creator:      clientMSPID,
		Verified:     false,
		Metadata:     metadata,
	}

	eventJSON, err := json.Marshal(event)
	if err != nil {
		return nil, err
	}

	if err := ctx.GetStub().PutState(id, eventJSON); err != nil {
		return nil, err
	}

	return &event, nil
}

// ReadEvidence retrieves an evidence entry from the ledger
func (s *SmartContract) ReadEvidence(ctx contractapi.TransactionContextInterface, id string) (*EvidenceEntry, error) {
	eventJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if eventJSON == nil {
		return nil, fmt.Errorf("evidence %s does not exist", id)
	}

	var event EvidenceEntry
	if err := json.Unmarshal(eventJSON, &event); err != nil {
		return nil, err
	}

	return &event, nil
}

// GetAllEvidenceByAlert returns all evidence for a specific alert
func (s *SmartContract) GetAllEvidenceByAlert(ctx contractapi.TransactionContextInterface, alertID string) ([]*EvidenceEntry, error) {
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var evidence []*EvidenceEntry
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var event EvidenceEntry
		if err := json.Unmarshal(queryResponse.Value, &event); err != nil {
			continue
		}

		if event.AlertID == alertID {
			evidence = append(evidence, &event)
		}
	}

	return evidence, nil
}

// VerifyEvidence marks an evidence entry as verified
func (s *SmartContract) VerifyEvidence(ctx contractapi.TransactionContextInterface, id string) (*EvidenceEntry, error) {
	event, err := s.ReadEvidence(ctx, id)
	if err != nil {
		return nil, err
	}

	event.Verified = true
	eventJSON, err := json.Marshal(event)
	if err != nil {
		return nil, err
	}

	if err := ctx.GetStub().PutState(id, eventJSON); err != nil {
		return nil, err
	}

	return event, nil
}

// EvidenceExists returns true when evidence with given ID exists
func (s *SmartContract) EvidenceExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	eventJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}
	return eventJSON != nil, nil
}

// GetEvidenceHistory returns the modification history for an evidence entry
func (s *SmartContract) GetEvidenceHistory(ctx contractapi.TransactionContextInterface, id string) ([]map[string]interface{}, error) {
	resultsIterator, err := ctx.GetStub().GetHistoryForKey(id)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var history []map[string]interface{}
	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var event EvidenceEntry
		if err := json.Unmarshal(response.Value, &event); err != nil {
			continue
		}

		history = append(history, map[string]interface{}{
			"tx_id":    response.TxId,
			"value":    event,
			"timestamp": time.Unix(response.Timestamp.Seconds, int64(response.Timestamp.Nanos)).Format(time.RFC3339),
			"is_delete": response.IsDelete,
		})
	}

	return history, nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating evidence chaincode: %s", err.Error())
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting evidence chaincode: %s", err.Error())
	}
}
