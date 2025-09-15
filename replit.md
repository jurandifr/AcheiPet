# Overview

"Achei um Pet" is a responsive web application designed to help users report and locate stray animals in need of assistance. The platform allows users to capture photos of animals with GPS coordinates and displays them on an interactive map for potential rescuers to find. The system integrates AI analysis for automatic animal type and breed identification, making it easier to categorize and filter animal reports.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite for build tooling
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Shadcn/ui component library with Radix UI primitives and Tailwind CSS for styling
- **State Management**: TanStack Query for server state management and caching
- **Form Handling**: React Hook Form with Zod validation
- **Map Integration**: Leaflet for interactive map functionality
- **Camera Access**: Browser Web APIs for camera capture and geolocation

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with multipart file upload support using Multer
- **Data Storage**: PostgreSQL database with Drizzle ORM for type-safe database operations
- **File Storage**: Local filesystem storage for uploaded images in `imagens_recebidas/` directory
- **Image Processing**: Sharp library for image resizing and optimization

## Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM providing type-safe database access
- **Schema**: Single `animal_reports` table containing location data, timestamps, image paths, AI analysis results, and optional user comments/contact info
- **File Storage**: Local filesystem for processed animal photos with unique naming convention
- **Development Storage**: In-memory storage implementation for development/testing

## Authentication and Authorization
- Currently implemented with a simple session-based approach
- No complex authentication system - focuses on anonymous reporting for ease of use

## AI Integration
- **Provider**: Google Gemini AI (specifically gemma-3-12b-it model)
- **Purpose**: Automatic analysis of uploaded animal photos to determine type (Dog/Cat/Other) and breed
- **Processing**: Images are analyzed after upload to populate animal metadata automatically
- **Fallback**: System handles AI failures gracefully with default categorization

# External Dependencies

## Third-Party Services
- **Google Gemini AI**: For automated animal photo analysis and classification
- **OpenStreetMap Nominatim**: Reverse geocoding service to convert GPS coordinates to human-readable addresses
- **Leaflet Maps**: Interactive map rendering and marker management

## Core Libraries
- **Database**: @neondatabase/serverless for PostgreSQL connection, Drizzle ORM for database operations
- **Image Processing**: Sharp for server-side image manipulation and optimization
- **Geolocation**: Browser Geolocation API for GPS coordinates, geopy-equivalent functionality via Nominatim
- **File Upload**: Multer for handling multipart form data and file uploads
- **Validation**: Zod for runtime type checking and form validation

## Development Tools
- **Build System**: Vite for fast development and optimized production builds
- **Database Migrations**: Drizzle Kit for schema management and migrations
- **Development Server**: Express with Vite middleware for hot module replacement
- **Environment Configuration**: dotenv for environment variable management