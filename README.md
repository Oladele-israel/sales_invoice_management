This is a comprehensive Invoice Management API built with NestJS and Prisma. It provides endpoints for creating, reading, updating, and deleting invoices, as well as filtering invoices by payment status and date range. The API also supports file uploads and associates them with invoices.

Features
CRUD Operations: Create, read, update, and delete invoices.
File Uploads: Upload files and associate them with invoices
Filtering: Filter invoices by payment status and date range.
Validation: Ensure unique invoice numbers and valid date ranges
Error Handling: Graceful error handling with meaningful error messages.
Logging: Log key actions for debugging and monitoring.

Technologies Used
NestJS: A progressive Node.js framework for building efficient and scalable server-side applications.
Prisma: A modern database toolkit for TypeScript and Node.js.
Multer: A web application framework for Node.js, used for file uploads.
TypeScript: A typed superset of JavaScript that compiles to plain JavaScript.
PostgreSQL: A powerful, open-source relational database system.
cloudinary for remote storage

API Endpoints
Create Invoice
Endpoint: POST /invoice/create
------------Description: Creates a new invoice with optional file uploads.
Request Body: json
Copy
{
  "invoiceNumber": "INV-001",
  "date": "2023-05-15",
  "totalAmount": "1000",
  "paymentStatus": "PAID"
}
Files: Optional file uploads (e.g., PDFs, images).

Response:json
{
  "message": "Invoice created successfully",
  "data": {
    "id": "1",
    "invoiceNumber": "INV-001",
    "date": "2023-05-15T00:00:00.000Z",
    "totalAmount": 1000,
    "paymentStatus": "PAID",
    "files": [
      {
        "id": "file1",
        "url": "https://example.com/file1"
      }
    ]
  }
}

--------------------------------Get All Invoices
Endpoint: GET /invoice
Description: Fetches all invoices from the database.

--------------------------------Get Single Invoice by ID
Endpoint: GET /invoice/:id
Description: Fetches a single invoice by its ID.

--------------------------------Update Invoice by ID
Endpoint: PATCH /invoice/:id
Description: Updates an existing invoice by its ID.

-------------------------------Delete Invoice by ID
Endpoint: DELETE /invoice/:id
Description: Deletes an invoice by its ID.

-----------------------Filter Invoices by Date Range
Endpoint: GET /invoice/filter/date?startDate=2023-01-01&endDate=2023-12-31
Description: Fetches invoices within a specified date range.

---------------------------------------Error Handling
The API returns meaningful error messages for common issues:
Bad Request (400): Invalid input (e.g., missing payment status, invalid date range).
Not Found (404): Resource not found (e.g., invoice not found).
Internal Server Error (500): Server-side issues (e.g., database connection error).

