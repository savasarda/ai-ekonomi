-- Update transaction types to Turkish
UPDATE transactions SET type = 'nakit' WHERE type = 'debt';
UPDATE transactions SET type = 'taksitli' WHERE type = 'installment';
