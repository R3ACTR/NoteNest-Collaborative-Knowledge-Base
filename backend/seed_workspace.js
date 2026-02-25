const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '.env') });

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error('MONGO_URI must be provided');
  process.exit(1);
}

async function seed() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB at', mongoUri);

    const UserSchema = new mongoose.Schema({ 
        email: { type: String, required: true, unique: true }, 
        password: { type: String, required: true },
        name: { type: String, required: true },
        role: { type: String, default: 'user' }
    });
    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    const WorkspaceSchema = new mongoose.Schema({
      name: { type: String, required: true },
      owner: { type: String, required: true },
      members: [{ userId: String, role: String }],
      createdAt: { type: Date, default: Date.now }
    });
    const Workspace = mongoose.models.Workspace || mongoose.model('Workspace', WorkspaceSchema);

    const NoteSchema = new mongoose.Schema({
        title: { type: String, required: true },
        content: { type: String },
        workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
        ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        createdAt: { type: Date, default: Date.now }
    });
    const Note = mongoose.models.Note || mongoose.model('Note', NoteSchema);

    let user = await User.findOne({ email: 'admin@example.com' });
    if (!user) {
      console.log('Creating user admin@example.com');
      const hashedPassword = await bcrypt.hash('password123', 10);
      user = new User({ 
          email: 'admin@example.com', 
          password: hashedPassword, 
          name: 'Admin User' 
      });
      await user.save();
    }

    console.log('User ID:', user._id);

    let workspace = await Workspace.findOne({ owner: user._id.toString() });
    if (workspace) {
      console.log('Workspace already exists:', workspace._id);
    } else {
      workspace = new Workspace({
        name: 'My Workspace',
        owner: user._id.toString(),
        members: [{ userId: user._id.toString(), role: 'admin' }]
      });
      await workspace.save();
      console.log('Created workspace:', workspace._id);
    }

    const noteCount = await Note.countDocuments({ workspaceId: workspace._id });
    if (noteCount === 0) {
        const note = new Note({
            title: 'Welcome Note',
            content: 'This is your first note in NoteNest! You can use Markdown here.',
            workspaceId: workspace._id,
            ownerId: user._id
        });
        await note.save();
        console.log('Created welcome note:', note._id);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding:', error);
    process.exit(1);
  }
}

seed();
