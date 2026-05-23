# DriveFleet Backend API

Production-ready Node.js + Express + MongoDB API server for the DriveFleet luxury car rental platform.

## Features

- **Express.js** REST API server
- **MongoDB** with Mongoose ODM
- **JWT** authentication with HTTP-only cookies
- **Password hashing** with bcrypt
- **CORS** support for frontend integration
- **Environment configuration** with dotenv
- **Vercel** deployment ready (serverless)

## Project Structure

```
js/
├── server.js              # Main server file
├── models/               # Mongoose schemas
│   ├── User.js
│   ├── Car.js
│   └── Booking.js
├── controllers/          # Route handlers
│   ├── authController.js
│   ├── carController.js
│   └── bookingController.js
├── routes/              # Express routes
│   ├── authRoutes.js
│   ├── carRoutes.js
│   └── bookingRoutes.js
└── middleware/          # Custom middleware
    └── auth.js          # JWT protection

vercel.json              # Vercel configuration
```

## Development

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### Setup

```bash
npm install
```

### Environment Configuration

Create `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/drivefleet
JWT_SECRET=your-secret-key-change-this
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Local Development Server

```bash
npm run dev
```

Server runs at `http://localhost:3000`

## Vercel Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel Dashboard:
   - `MONGODB_URI` - MongoDB connection string
   - `JWT_SECRET` - Secret key for JWT signing
   - `CORS_ORIGIN` - Frontend URL (e.g., https://your-frontend.vercel.app)
   - `NODE_ENV` - Set to `production`

## API Endpoints

### Authentication

```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
POST   /api/auth/logout      - Logout user
GET    /api/auth/me          - Get current user (protected)
```

### Cars

```
GET    /api/cars             - Get all cars (search supported)
GET    /api/cars/:id         - Get car by ID
POST   /api/cars             - Create car (protected)
PUT    /api/cars/:id         - Update car (protected)
DELETE /api/cars/:id         - Delete car (protected)
```

### Bookings

```
POST   /api/bookings         - Create booking (protected)
GET    /api/bookings/mine    - Get user's bookings (protected)
```

### Health Check

```
GET    /api/health           - Server health status
```

## Database Models

### User
```typescript
{
  name: String (required),
  email: String (required, unique),
  password: String (hashed, required),
  role: String (enum: 'user', 'admin', default: 'user'),
  timestamps: true
}
```

**Password Requirements:**
- At least 6 characters
- At least one uppercase letter
- At least one lowercase letter

### Car
```typescript
{
  title: String (required),
  brand: String (required),
  description: String (required),
  pricePerDay: Number (required),
  image: String (URL, required),
  isAvailable: Boolean (default: true),
  addedBy: ObjectId (User, required),
  bookingCount: Number (default: 0),
  timestamps: true
}
```

### Booking
```typescript
{
  user: ObjectId (User, required),
  car: ObjectId (Car, required),
  startDate: Date (required),
  endDate: Date (required),
  totalPrice: Number (required),
  status: String (enum: 'pending', 'confirmed', 'cancelled', 'completed'),
  timestamps: true
}
```

## Authentication

Uses JWT tokens stored in HTTP-only cookies:

```javascript
// Cookie options
{
  httpOnly: true,        // Not accessible via JavaScript
  secure: true,          // HTTPS only in production
  sameSite: 'none',      // Allow cross-site in production
  maxAge: 30 * 24 * 60 * 60 * 1000  // 30 days
}
```

## Request Examples

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }' \
  -c cookies.txt
```

### Get Current User (Protected)
```bash
curl http://localhost:3000/api/auth/me \
  -b cookies.txt
```

### Create Car (Protected)
```bash
curl -X POST http://localhost:3000/api/cars \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Porsche 911 GT3",
    "brand": "Porsche",
    "description": "High-performance sports car",
    "pricePerDay": 500,
    "image": "https://example.com/car.jpg"
  }'
```

### Search Cars
```bash
curl "http://localhost:3000/api/cars?keyword=porsche"
```

### Create Booking (Protected)
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "carId": "ObjectId",
    "startDate": "2024-06-01",
    "endDate": "2024-06-05",
    "totalPrice": 2500
  }'
```

## Environment Variables

### Required
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing

### Optional
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (default: development)
- `CORS_ORIGIN` - Frontend URL for CORS (default: http://localhost:5173)

## Deployment

See the main `DEPLOYMENT_GUIDE.md` for cPanel deployment instructions.

### Production Checklist
- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Update `CORS_ORIGIN` to frontend URL
- [ ] Enable HTTPS (SSL certificate)
- [ ] Whitelist IP in MongoDB Atlas
- [ ] Setup PM2 or supervisor for process management
- [ ] Configure reverse proxy (nginx/Apache)
- [ ] Enable monitoring and logging

### Build for Production
```bash
npm run build  # Creates dist/server.cjs
npm start      # Runs compiled version
```

## Error Handling

Standard HTTP status codes:
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

Error response format:
```json
{
  "message": "Error description"
}
```

## Security Features

- **Password Hashing:** bcrypt with 10 salt rounds
- **JWT Protection:** Tokens expire in 30 days
- **CORS:** Configurable origin
- **HTTP-only Cookies:** Prevents XSS attacks
- **Input Validation:** Required fields checked
- **Authorization:** User ownership verified for updates/deletes

## Performance Optimization

- MongoDB connection pooling
- Efficient indexes on searchable fields
- Lean queries where appropriate
- Error recovery with automatic reconnection

## Dependencies

### Production
- express 4.21+ - Web framework
- mongoose 9.6+ - MongoDB ODM
- bcrypt 6.0+ - Password hashing
- jsonwebtoken 9.0+ - JWT signing
- cookie-parser 1.4+ - Cookie handling
- cors 2.8+ - CORS middleware
- dotenv 17.2+ - Environment variables

### Development
- typescript 5.8+ - Type safety
- tsx 4.21+ - Dynamic TypeScript execution
- esbuild 0.25+ - Fast bundling
- @types/* - TypeScript definitions

## Common Issues

### MongoDB Connection Failed
- Check MONGODB_URI format
- Verify IP is whitelisted in MongoDB Atlas
- Test connection: `node -e "require('mongoose').connect(process.env.MONGODB_URI)"`

### JWT Token Expired
- Frontend needs to handle 401 and redirect to login
- Tokens expire in 30 days

### CORS Errors
- Update `CORS_ORIGIN` in .env
- Frontend and backend domains must match exactly

### Port Already in Use
- Change `PORT` in .env
- Or kill existing process: `lsof -i :3000 | kill -9`

## License

Proprietary - DriveFleet Project
