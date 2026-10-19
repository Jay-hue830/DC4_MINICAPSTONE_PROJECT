# Entity relationship diagram

```mermaid
erDiagram
    USERS ||--o| SENIOR_CITIZENS : "has profile"
    SENIOR_CITIZENS ||--o{ ASSISTANCE_REQUESTS : submits
    ASSISTANCE_TYPES ||--o{ ASSISTANCE_REQUESTS : categorizes
    USERS o|--o{ ASSISTANCE_REQUESTS : reviews

    USERS {
        bigint id PK
        string name
        string email UK
        string password
        enum role
        timestamp created_at
        timestamp updated_at
    }

    SENIOR_CITIZENS {
        bigint id PK
        bigint user_id FK,UK
        string first_name
        string middle_name
        string last_name
        date birth_date
        enum sex
        string contact_number
        string address
        string barangay
        string emergency_contact_name
        string emergency_contact_number
        text health_notes
        timestamp created_at
        timestamp updated_at
    }

    ASSISTANCE_TYPES {
        bigint id PK
        string name UK
        text description
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    ASSISTANCE_REQUESTS {
        bigint id PK
        bigint senior_citizen_id FK
        bigint assistance_type_id FK
        bigint reviewed_by FK
        string title
        text description
        date date_needed
        enum status
        timestamp reviewed_at
        text admin_remarks
        timestamp created_at
        timestamp updated_at
    }
```

`senior_citizens.user_id` is unique, so each account can be associated with at most one senior profile. A user registered as a senior receives that profile during registration. Requests belong to a senior profile and an assistance type. `reviewed_by` references the admin user who last reviewed a request and becomes null if that user is deleted.

Application roles are `admin` and `senior_citizen`. The `senior` value from the original schema is migrated to `senior_citizen`; it is not an application role.

Senior profiles with requests are protected from deletion by the API. The database currently cascades request rows when a senior profile is deleted, so the controller check is necessary to preserve request history.
