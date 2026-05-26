# Security Specification for Nothing Phone Dialer DB

## 1. Data Invariants
- A contact document inside `/users/{userId}/contacts/{contactId}` must have a `userId` property matching the document's parent `{userId}`, which also matches `request.auth.uid`.
- A call log document inside `/users/{userId}/callLogs/{logId}` must have a `userId` property matching the document's parent `{userId}`, which also matches `request.auth.uid`.
- Read and write operations are strictly partition-isolated: a user can only read and write their own documents.

## 2. The "Dirty Dozen" Payloads (Denial/Exploit Inputs)
Below are 12 malicious payloads meant to breach Identity, Integrity, or State constraints, which our `firestore.rules` will strictly prevent:

1. **Identity Theft (Foreign Write)**: Attempting to create a contact under another user's sub-collection (`users/alice/contacts/c1`) by a user named Bob (`request.auth.uid == "bob"`).
2. **Identity Spoofing**: Attempting to create a contact with `userId` set to "alice" under Bob's subcollection (`users/bob/contacts/c1`).
3. **Empty Name Injection**: Attempting to create a contact with an empty name `""`.
4. **Giant ID Poisoning**: Creating a contact with ID longer than 128 characters or containing unapproved characters (`users/bob/contacts/$$INVALID_ID$$`).
5. **No Label Field**: Attempting to save a contact omitting the required `label` field.
6. **Malicious Call Log Duration**: Injecting highly abnormal string lengths for call duration (e.g. 1MB string) to try and exhaust reader parsing time.
7. **Invalid Call Log Type**: Writing a call log type other than 'missed', 'received', or 'made'.
8. **Malicious Image Avatar Injection**: Injecting script/unapproved scheme URLs into the `image` avatar field.
9. **Modifying Immortal Fields**: Attempting to change `userId` or `id` during a contact document update.
10. **Unauthenticated Read / Collection Scraping**: Querying the full collection of contacts without being signed in (`request.auth == null`).
11. **Cross-Tenant Navigation**: Trying to retrieve Alice's private contact document while logged in as Bob.
12. **Tampering with Log Times**: Creating or updating logs with arbitrary historical dates or client-spoofed dates instead of server timestamp guidelines.
