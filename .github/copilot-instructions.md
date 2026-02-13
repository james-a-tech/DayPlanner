# Day Planner - Setup and Development Guides

## Quick Start

### Install Dependencies
```bash
# From root directory
npm install

cd backend && npm install
cd ../frontend && npm install
```

### Run Development Servers
```bash
# From root - runs both backend and frontend
npm run dev

# Or separately:
npm run backend    # Terminal 1
npm run frontend   # Terminal 2
```

### First Time Setup

1. **MongoDB Setup**
   - Install MongoDB locally or use MongoDB Atlas
   - Update `backend/.env` with connection string

2. **Google Calendar Integration** (Optional)
   - Get OAuth credentials from Google Cloud Console
   - Add to `backend/.env`

3. **Access Application**
   - Frontend: http://localhost:3000
   - API: http://localhost:5000/api/health

## Feature Checklist

- [x] Task creation with priority & duration
- [x] Time slot templates (lunch, travel, etc.)
- [ ] Google Calendar sync integration
- [ ] Cloud backup (S3) implementation
- [ ] Daily accomplishment tracking
- [ ] Analytics dashboard
- [ ] Improvement suggestions based on history

## Next Steps for Enhancement

1. **Google Calendar Integration**
   - Implement OAuth flow
   - Sync free/busy events
   - Auto-suggest task slots

2. **Cloud Backup**
   - AWS S3 integration
   - Automatic daily backups
   - Data restore functionality

3. **Advanced Analytics**
   - Performance trends
   - Productivity insights
   - Category-based analytics

4. **UI/UX Enhancements**
   - Dark mode
   - Drag-and-drop task scheduling
   - Mobile app version

## API Documentation

All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

See `backend/src/routes/` for complete endpoint implementations.

## Troubleshooting

**MongoDB Connection Error**
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`

**Port Already in Use**
- Change PORT in backend `.env`
- Change port in frontend `vite.config.ts`

**CORS Issues**
- Frontend proxy is configured in `vite.config.ts`
- Backend CORS middleware is enabled

## Development Notes

- TypeScript strict mode is enabled for type safety
- All API calls go through `/src/api/client.ts`
- State management uses Zustand for simplicity
- React Query handles server state
