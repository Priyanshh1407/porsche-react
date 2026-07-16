import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    //Personal Information
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 letters'],
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 letters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    },

    //Inquiry Details
    inquiryType: {
        type: String,
        required: [true, 'Inquiry type is required'],
        enum: {
            values: ['Sales', 'Service', 'Test_Drive', 'Parts', 'Financing', 'General'],
            message: 'Invalid Inquiry type'
        }
    },
    modelInterest: {
        type: String,
        enum: ['911', '718_Cayman', '718_Boxster', 'Cayenne', 'Macan', 'Panamera', 'Taycan', 'CarreraGT', 'Cayman_GT4RS', 'GT2RS_911', 'GT3RS', 'Spyder_918', 'TurboS_911', 'Other', 'Not_specified'],
        default: 'Not_specified'
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true,
        maxlength: [1000, 'Message cannot exceed 1000 letters'],
    },

    // Preferences
    preferredContactMethod: {
        type: String,
        enum: ['Email', 'Phone', 'Either'],
        default: 'Either',
    },
    preferredContactTime: {
        type: String,
        enum: ['Morning', 'Afternoon', 'Evening', 'Anytime'],
        default: 'Anytime'
    },

    // System feilds
    status: {
        type: String,
        enum: ['New', 'Contacted', 'Qualified', 'Closed'],
        default: 'New'
    },
    source: {
        type: String,
        default: 'Website'
    },
    ipAddress: {
        type: String,
    },
    userAgent: {
        type: String
    },

    // Tracking
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    contactedAt: {
        type: Date,
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 character']
    },
}, {
    timestamps: true
});

// Indexes for better query performance 
contactSchema.index({ email: 1 });
contactSchema.index({ createdAt: -1 });
contactSchema.index({ status: 1 });
contactSchema.index({ inquiryType: 1 });

// Virtual for full name
contactSchema.virtual('fullName').get(function () {
    return `${this.firstName } ${this.lastName }`;
});

export default mongoose.model('Contact', contactSchema);