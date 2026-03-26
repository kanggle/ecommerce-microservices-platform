# Service Dependencies

## Service
`auth-service`

## Allowed Direct Dependencies
- shared technical libraries allowed by platform policy
- own database
- own cache if required
- platform-approved security components

## Allowed Service Interactions
- through published HTTP contracts
- through published event contracts

## Forbidden Dependencies
- direct database access to another service
- importing another service's internal code
- depending on another service's internal entity model
- bypassing gateway or platform communication rules where applicable

## Notes
All dependency changes that affect service boundaries must be reflected in related specs and contracts first.