import mongoose, { Schema, Document } from 'mongoose';

export type TemplateCategory =
  | 'meeting'
  | 'rfc'
  | 'design'
  | 'project'
  | 'bug_report'
  | 'retrospective'
  | 'onboarding'
  | 'research'
  | 'sprint'
  | 'general';

export type TemplateVisibility = 'private' | 'workspace' | 'public';

export interface ITemplatePlaceholder {
  name: string;         // e.g. "date", "attendees"
  label: string;        // Human-readable label
  type: 'text' | 'date' | 'list' | 'number';
  defaultValue?: string;
  description?: string;
  required: boolean;
}

export interface ITemplate extends Document {
  workspaceId: string | null;
  ownerId: string;
  title: string;
  description: string;
  category: TemplateCategory;
  tags: string[];
  body: string;               // Markdown body with {{placeholder}} syntax
  placeholders: ITemplatePlaceholder[];
  visibility: TemplateVisibility;
  version: number;
  usageCount: number;
  previewContent: string;    // Short excerpt for card display (auto-generated)
  isBuiltIn: boolean;        // True = system template, cannot be deleted
  createdAt: Date;
  updatedAt: Date;
}

const PlaceholderSchema = new Schema<ITemplatePlaceholder>(
  {
    name: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: ['text', 'date', 'list', 'number'], default: 'text' },
    defaultValue: { type: String },
    description: { type: String },
    required: { type: Boolean, default: false },
  },
  { _id: false }
);

const TemplateSchema: Schema = new Schema<ITemplate>(
  {
    workspaceId: { type: String, default: null },
    ownerId: { type: String, required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    category: {
      type: String,
      enum: ['meeting', 'rfc', 'design', 'project', 'bug_report', 'retrospective', 'onboarding', 'research', 'sprint', 'general'],
      default: 'general',
    },
    tags: [{ type: String, trim: true }],
    body: { type: String, required: true },
    placeholders: { type: [PlaceholderSchema], default: [] },
    visibility: {
      type: String,
      enum: ['private', 'workspace', 'public'],
      default: 'workspace',
    },
    version: { type: Number, default: 1 },
    usageCount: { type: Number, default: 0 },
    previewContent: { type: String, default: '' },
    isBuiltIn: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
TemplateSchema.index({ workspaceId: 1, category: 1 });
TemplateSchema.index({ workspaceId: 1, visibility: 1 });
TemplateSchema.index({ ownerId: 1 });
TemplateSchema.index({ tags: 1 });
TemplateSchema.index({ isBuiltIn: 1 });
TemplateSchema.index({ title: 'text', description: 'text', tags: 'text' });

export default mongoose.model<ITemplate>('Template', TemplateSchema);
