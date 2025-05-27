# Backend Guide: `applications` Collection

This guide outlines how to create a Mongoose schema and API routes for managing different types of applications (seller, agent, admin) in your SmartAgroConnect backend.

## 1. Mongoose Schema (`applicationModel.js`)

Create a new file, for example, `models/applicationModel.js` (adjust path as per your project structure):

```javascript
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model
    required: true,
  },
  applicationType: {
    type: String,
    enum: ['seller-application', 'agent-application', 'admin-application'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'in-review'],
    default: 'pending',
    required: true,
  },
  formData: {
    // Store raw form data as a flexible object
    // This can vary based on applicationType
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  // Seller-specific fields (examples)
  businessName: {
    type: String,
    // Only required if applicationType is 'seller-application'
    // You can add custom validators or handle this in your service layer
  },
  businessRegistrationNumber: {
    type: String,
  },
  // Agent-specific fields (examples)
  agentIdProvided: {
    type: String,
  },
  regionOfOperation: {
    type: String,
  },
  // Admin-application specific (can be simpler)
  reasonForAdminAccess: {
    type: String,
  },
  // Common application details
  submissionDate: {
    type: Date,
    default: Date.now,
  },
  reviewDate: {
    type: Date,
  },
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Admin/Agent who reviews
  },
  notes: [
    {
      noteBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      noteText: String,
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  // Attachments (e.g., ID proofs, business documents)
  attachments: [
    {
      fileName: String,
      fileUrl: String, // URL from Cloudinary or other storage
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
}, { timestamps: true });

// Indexing for better query performance
applicationSchema.index({ userId: 1, applicationType: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ submissionDate: -1 });

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
```

**Explanation of Schema Fields:**

*   `userId`: Reference to the user submitting the application.
*   `applicationType`: Enum to define the type of application.
*   `status`: Tracks the current state of the application.
*   `formData`: A `Mixed` type field to store the raw JSON data from the client-side form. This provides flexibility as different application types will have different form fields.
*   **Specific Fields (Optional but Recommended):**
    *   While `formData` is flexible, you might want to promote frequently queried or validated fields directly to the top level of the schema for easier access and indexing (e.g., `businessName` for sellers).
    *   These are examples; tailor them to your exact needs.
*   `submissionDate`: Automatically set when an application is created.
*   `reviewDate`: Date when the application was last reviewed/actioned.
*   `reviewerId`: The admin/user who reviewed the application.
*   `notes`: An array to keep track of any notes or comments made during the review process.
*   `attachments`: An array to store links to any uploaded documents (e.g., ID proofs, business licenses). Store the actual files on a service like Cloudinary and save the URLs here.
*   `timestamps`: Automatically adds `createdAt` and `updatedAt` fields.

**Important Considerations for `formData`:**

*   **Validation:** Since `formData` is `Mixed`, Mongoose won't apply schema-level validation to its contents directly. You'll need to handle the validation of these dynamic fields in your route handlers or service layer *before* saving the application. For example, if `applicationType` is `seller-application`, you'd check if the required seller fields are present in `formData`.
*   **Querying:** Querying nested fields within a `Mixed` type can be less efficient than querying top-level indexed fields. If you find yourself frequently querying specific fields within `formData`, consider promoting them to be top-level fields in the schema.

## 2. API Routes (`applicationRoutes.js`)

Create a new file, for example, `routes/applicationRoutes.js`:

```javascript
const express = require('express');
const router = express.Router();
const Application = require('../models/applicationModel'); // Adjust path
const authMiddleware = require('../middleware/authMiddleware'); // Your JWT auth middleware
const adminMiddleware = require('../middleware/adminMiddleware'); // Middleware to check if user is admin or authorized role

// **User Routes (for submitting and viewing their own applications)**

// POST /api/applications - Submit a new application
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { applicationType, formData, attachments } = req.body;
    const userId = req.user.id; // Assuming authMiddleware adds user to req

    // --- Server-side validation of formData based on applicationType --- 
    // Example for 'seller-application':
    if (applicationType === 'seller-application') {
      if (!formData.businessName || !formData.businessAddress /* ... other required fields */) {
        return res.status(400).json({ message: 'Missing required seller application fields in formData.' });
      }
    }
    // Add similar validation for 'agent-application' and 'admin-application'
    // --- End of validation ---

    const newApplication = new Application({
      userId,
      applicationType,
      formData,
      attachments, // Assuming attachments are pre-uploaded and URLs are provided
      // Add specific fields if you promoted them, e.g.:
      // businessName: applicationType === 'seller-application' ? formData.businessName : undefined,
    });

    await newApplication.save();
    res.status(201).json({ message: 'Application submitted successfully!', application: newApplication });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ message: 'Server error while submitting application.', error: error.message });
  }
});

// GET /api/applications/my-applications - Get all applications for the logged-in user
router.get('/my-applications', authMiddleware, async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user.id }).sort({ submissionDate: -1 });
    res.json(applications);
  } catch (error) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({ message: 'Server error while fetching applications.', error: error.message });
  }
});

// GET /api/applications/:id - Get a specific application by ID (user must own it or be admin)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('userId', 'name email');
    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }
    // Check if the logged-in user is the owner or an admin (implement admin check as needed)
    if (application.userId._id.toString() !== req.user.id /* && !req.user.isAdmin */) {
      return res.status(403).json({ message: 'You are not authorized to view this application.' });
    }
    res.json(application);
  } catch (error) {
    console.error('Error fetching application by ID:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});


// **Admin/Reviewer Routes (for managing applications)**
// These routes should be protected by an admin/reviewer role middleware

// GET /api/applications - Get all applications (for admins/reviewers)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (type) query.applicationType = type;

    const applications = await Application.find(query)
      .populate('userId', 'name email profilePicture') // Populate user details
      .sort({ submissionDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Application.countDocuments(query);

    res.json({
      applications,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalApplications: count,
    });
  } catch (error) {
    console.error('Error fetching all applications:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// PUT /api/applications/:id/status - Update application status (for admins/reviewers)
router.put('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, notesText } = req.body;
    const reviewerId = req.user.id;

    if (!['pending', 'approved', 'rejected', 'in-review'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    application.status = status;
    application.reviewDate = new Date();
    application.reviewerId = reviewerId;

    if (notesText) {
      application.notes.push({ noteBy: reviewerId, noteText });
    }

    // **Logic for role update upon approval:**
    // If an application (e.g., seller-application) is approved, 
    // you might want to update the user's role in your User model.
    if (status === 'approved') {
      // const userToUpdate = await User.findById(application.userId);
      // if (userToUpdate) {
      //   if (application.applicationType === 'seller-application') userToUpdate.role = 'seller';
      //   else if (application.applicationType === 'agent-application') userToUpdate.role = 'agent';
      //   // ... handle other types or more complex role logic
      //   await userToUpdate.save();
      //   // Potentially, notify the user about role change
      // }
      // Placeholder for user role update logic
      console.log(`Application ${application._id} approved. User ${application.userId} role might need update to ${application.applicationType.split('-')[0]}.`);
    }

    await application.save();
    res.json({ message: 'Application status updated.', application });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// POST /api/applications/:id/notes - Add a note to an application (for admins/reviewers)
router.post('/:id/notes', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { noteText } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }
    if (!noteText) {
      return res.status(400).json({ message: 'Note text is required.' });
    }

    application.notes.push({ noteBy: req.user.id, noteText });
    await application.save();
    res.json({ message: 'Note added successfully.', application });

  } catch (error) {
    console.error('Error adding note to application:', error);
    res.status(500).json({ message: 'Server error while adding note.', error: error.message });
  }
});

// DELETE /api/applications/:id - Delete an application (for admins, use with caution)
// router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => { ... });

module.exports = router;

```

**Key Routes:**

*   **User-Facing:**
    *   `POST /api/applications`: Users submit new applications.
    *   `GET /api/applications/my-applications`: Users view their own submitted applications.
    *   `GET /api/applications/:id`: User views a specific application they submitted.
*   **Admin/Reviewer-Facing:**
    *   `GET /api/applications`: Admins/reviewers get a list of all applications (with filtering for status, type, and pagination).
    *   `PUT /api/applications/:id/status`: Admins/reviewers update the status of an application (e.g., approve, reject).
        *   **Crucial:** This is where you'd also implement logic to update the user's role in your main `User` collection if an application is approved (e.g., change role to 'seller').
    *   `POST /api/applications/:id/notes`: Admins/reviewers add notes to an application during the review process.

**Middleware:**

*   `authMiddleware`: Ensures the user is logged in. It should attach user information (like `req.user.id`) to the request object.
*   `adminMiddleware` (or a more generic `roleMiddleware`): Protects routes that should only be accessible by users with specific roles (e.g., 'admin', 'reviewer').

## 3. Integrating into your Express App

In your main server file (e.g., `server.js` or `app.js`):

```javascript
// ... other imports
const applicationRoutes = require('./routes/applicationRoutes'); // Adjust path

// ... other app setup (mongoose connection, middleware)

// Mount the routes
app.use('/api/applications', applicationRoutes);

// ... error handling and server listen
```

## 4. Client-Side Form Data

When the client submits a form for an application:

1.  **Collect all form data** into a single JSON object.
2.  This object will be sent as `formData` in the POST request to `/api/applications`.
3.  If there are file uploads (e.g., for `attachments`):
    *   The client should first upload these files to your chosen storage (like Cloudinary).
    *   Receive the URLs and relevant file names from the storage service.
    *   Include an array of objects like `{ fileName, fileUrl }` in the `attachments` field of your request body.

**Example Client-Side Request Body (for a seller application):**

```json
{
  "applicationType": "seller-application",
  "formData": {
    "businessName": "Green Valley Organics",
    "businessRegistrationNumber": "REG12345XYZ",
    "businessAddress": "123 Organic Lane, Farmville",
    "contactPerson": "John Farmer",
    "yearsInOperation": 5,
    "productTypes": ["Vegetables", "Fruits", "Dairy"],
    "deliveryOptions": ["Home Delivery", "Market Pickup"]
    // ... any other fields from your seller application form
  },
  "attachments": [
    {
      "fileName": "business_license.pdf",
      "fileUrl": "https://cloudinary.com/path/to/business_license.pdf"
    },
    {
      "fileName": "id_proof_john_farmer.jpg",
      "fileUrl": "https://cloudinary.com/path/to/id_proof.jpg"
    }
  ]
}
```

This structure provides a good balance of structured data (for common fields and status) and flexibility (for varying form data across application types).
Remember to implement robust error handling, logging, and user notifications (e.g., when an application status changes). 