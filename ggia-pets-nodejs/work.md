FILTER TESTING
STATUS FILTER
GET /super-admin/acknowledgments?status=1
CHANNEL FILTER
GET /super-admin/acknowledgments?channel=email
DATE FILTER
GET /super-admin/acknowledgments?fromDate=2026-05-01&toDate=2026-05-30
MUNICIPALITY FILTER
GET /super-admin/acknowledgments?municipality=MUNICIPALITY_ID
EXPORT CSV TEST
URL
GET /api/super-admin/export-acknowledgments
HEADER
Authorization: Bearer TOKEN
EXPECTED

Browser/Postman downloads:

acknowledgments.csv
DISABLE CITY ADMIN TEST
URL
POST /api/super-admin/disable-city-admin
BODY
{
   "userId":"CITY_ADMIN_USER_ID"
}
EXPECTED
{
   "success": true,
   "message": "City admin disabled"
}
DATABASE CHECK
"isActive": false
LOGIN TEST AFTER DISABLE

Disabled user login should fail:

{
   "success": false,
   "message": "User disabled"
}