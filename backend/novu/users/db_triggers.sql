-- THESE TRIGGERS MUST BE RAN AFTER EACH MIGRATION
-- Message trigger, to prevent insertions of senders thar are not part of the match id
CREATE TRIGGER IF NOT EXISTS message_sender_trigger BEFORE INSERT
ON messages 
BEGIN
    -- if sender_id is not inside match.user_1 or match_user2 raise an exception
    IF sender_id NOT IN (SELECT user1_id FROM `match m` WHERE m.id = m.id ) OR (SELECT user2_id FROM `match` WHERE id = sender_id)

END