-- Rename the order column to sequence in test_cases table
ALTER TABLE test_cases CHANGE `order` sequence INT NOT NULL; 