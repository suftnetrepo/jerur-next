import mongoose from 'mongoose';
import { Schema } from 'mongoose';
import { ARTICLE_STATUS, ARTICLE_STATUS_VALUES } from '../../constants/articles';

// Deliberately its own top-level collection, not embedded on Church (unlike
// e.g. Church.sliders/pastor_section) - a church can only ever have a
// handful of these (see MAX_ARTICLES_PER_CHURCH), but each one carries a
// full rich-text body, and "embed a handful of small config objects" vs
// "own collection for content records with real bodies" is exactly the
// same distinction Event/Sermon/Campaign already draw elsewhere in this
// schema. Same shape/reasoning as app/models/event.js.
const ArticleSchema = new Schema(
  {
    church: { type: Schema.Types.ObjectId, ref: 'Church', required: true },
    title: {
      type: String,
      trim: true,
      required: true,
      max: 150
    },
    summary: {
      type: String,
      trim: true,
      required: true,
      max: 300
    },
    // Tiptap-generated HTML - see src/components/reuseable/RichTextEditor.jsx.
    // Rendered as-is by the (future) mobile article reader screen.
    content: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ARTICLE_STATUS_VALUES,
      default: ARTICLE_STATUS.DRAFT
    },
    secure_url: {
      type: String,
      required: false,
      default: ''
    },
    public_id: {
      type: String,
      required: false,
      default: ''
    },
    // Set automatically the moment status flips to "published" - see
    // articleService.js. Never set directly from client input.
    publishedAt: {
      type: Date,
      required: false,
      default: null
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false }
  },
  { timestamps: true }
);

ArticleSchema.index({ church: 1, status: 1 });
ArticleSchema.index({ church: 1, publishedAt: -1 });
ArticleSchema.index({ title: 'text', summary: 'text' });

const Article = mongoose.models.Article || mongoose.model('Article', ArticleSchema);
export default Article;
