# Canva API Integration Guide for Tkrell

## Overview

This guide explains how to integrate Canva's API into Tkrell to enable design features for students and teachers.

## What is Canva API?

Canva API allows you to:

- Create and edit designs programmatically
- Generate custom study materials (posters, flashcards, infographics)
- Export designs in multiple formats (PDF, PNG, JPG)
- Manage design templates
- Integrate design creation into your application

## Prerequisites

1. **Canva Developer Account** - Sign up at https://www.canva.com/developers
2. **API Key and Secret** - Generated from your Canva app
3. **Node.js** - Already installed in your project

## Step 1: Get Canva API Credentials

### 1.1 Create a Canva App

1. Go to https://www.canva.com/developers
2. Sign in with your Canva account
3. Click "Your apps" in the top navigation
4. Click "Create an app"
5. Fill in the form:
   - **App name:** Tkrell
   - **App description:** Educational design integration for students
   - **Use case:** Education/Learning
6. Accept the terms and click "Create app"

### 1.2 Get Credentials

1. In your app dashboard, go to "Authentication"
2. Copy your **API Key** (also called Client ID)
3. Copy your **API Secret** (also called Client Secret)
4. Store these securely in your environment variables

## Step 2: Install Canva SDK

```bash
# Install the Canva SDK
pnpm add @canva/api

# Or if using npm
npm install @canva/api
```

## Step 3: Set Up Environment Variables

Add to your `.env.production` and `.env.local`:

```bash
CANVA_API_KEY=your_canva_api_key
CANVA_API_SECRET=your_canva_api_secret
CANVA_BRAND_ID=your_brand_id  # Optional
```

## Step 4: Create Canva Service

Create a new file `server/_core/canva.ts`:

```typescript
import axios from 'axios';

interface CanvaDesignOptions {
  title: string;
  width: number;
  height: number;
  backgroundColor?: string;
}

interface CanvaExportOptions {
  format: 'pdf' | 'png' | 'jpg';
  quality?: 'low' | 'medium' | 'high';
}

class CanvaService {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl = 'https://api.canva.com/v1';

  constructor() {
    this.apiKey = process.env.CANVA_API_KEY || '';
    this.apiSecret = process.env.CANVA_API_SECRET || '';

    if (!this.apiKey || !this.apiSecret) {
      throw new Error('Canva API credentials are not configured');
    }
  }

  /**
   * Create a new design
   */
  async createDesign(options: CanvaDesignOptions): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/designs`,
        {
          title: options.title,
          width: options.width,
          height: options.height,
          backgroundColor: options.backgroundColor || '#FFFFFF',
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error creating Canva design:', error);
      throw error;
    }
  }

  /**
   * Get design details
   */
  async getDesign(designId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/designs/${designId}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching Canva design:', error);
      throw error;
    }
  }

  /**
   * Export design to file
   */
  async exportDesign(
    designId: string,
    options: CanvaExportOptions
  ): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/designs/${designId}/exports`,
        {
          format: options.format,
          quality: options.quality || 'high',
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.exportUrl;
    } catch (error) {
      console.error('Error exporting Canva design:', error);
      throw error;
    }
  }

  /**
   * Create a study material (poster, flashcard, etc.)
   */
  async createStudyMaterial(
    title: string,
    subject: string,
    topic: string,
    gradeLevel: string
  ): Promise<any> {
    try {
      // Create a design with study material dimensions
      const design = await this.createDesign({
        title: `${subject} - ${topic}`,
        width: 800,
        height: 600,
        backgroundColor: '#F5F5F5',
      });

      // Add text elements for the study material
      const response = await axios.post(
        `${this.baseUrl}/designs/${design.id}/elements`,
        {
          elements: [
            {
              type: 'text',
              content: title,
              fontSize: 32,
              fontWeight: 'bold',
              x: 50,
              y: 50,
            },
            {
              type: 'text',
              content: `Subject: ${subject} | Grade: ${gradeLevel}`,
              fontSize: 14,
              x: 50,
              y: 100,
            },
            {
              type: 'text',
              content: `Topic: ${topic}`,
              fontSize: 18,
              fontWeight: 'bold',
              x: 50,
              y: 150,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error creating study material:', error);
      throw error;
    }
  }

  /**
   * Create a flashcard
   */
  async createFlashcard(
    question: string,
    answer: string,
    subject: string
  ): Promise<any> {
    try {
      const design = await this.createDesign({
        title: `Flashcard - ${subject}`,
        width: 400,
        height: 300,
        backgroundColor: '#FFFFFF',
      });

      // Add question and answer
      const response = await axios.post(
        `${this.baseUrl}/designs/${design.id}/elements`,
        {
          elements: [
            {
              type: 'text',
              content: 'Question:',
              fontSize: 16,
              fontWeight: 'bold',
              x: 20,
              y: 20,
            },
            {
              type: 'text',
              content: question,
              fontSize: 14,
              x: 20,
              y: 50,
              width: 360,
            },
            {
              type: 'line',
              x1: 20,
              y1: 150,
              x2: 380,
              y2: 150,
              color: '#CCCCCC',
            },
            {
              type: 'text',
              content: 'Answer:',
              fontSize: 16,
              fontWeight: 'bold',
              x: 20,
              y: 170,
            },
            {
              type: 'text',
              content: answer,
              fontSize: 14,
              x: 20,
              y: 200,
              width: 360,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error creating flashcard:', error);
      throw error;
    }
  }
}

export const canvaService = new CanvaService();
```

## Step 5: Create tRPC Router for Canva

Create `server/canva_routers.ts`:

```typescript
import { router, publicProcedure } from './_core/trpc';
import { z } from 'zod';
import { canvaService } from './_core/canva';

export const canvaRouter = router({
  createStudyMaterial: publicProcedure
    .input(
      z.object({
        title: z.string(),
        subject: z.string(),
        topic: z.string(),
        gradeLevel: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await canvaService.createStudyMaterial(
        input.title,
        input.subject,
        input.topic,
        input.gradeLevel
      );
    }),

  createFlashcard: publicProcedure
    .input(
      z.object({
        question: z.string(),
        answer: z.string(),
        subject: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await canvaService.createFlashcard(
        input.question,
        input.answer,
        input.subject
      );
    }),

  exportDesign: publicProcedure
    .input(
      z.object({
        designId: z.string(),
        format: z.enum(['pdf', 'png', 'jpg']),
        quality: z.enum(['low', 'medium', 'high']).optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await canvaService.exportDesign(input.designId, {
        format: input.format,
        quality: input.quality,
      });
    }),

  getDesign: publicProcedure
    .input(z.object({ designId: z.string() }))
    .query(async ({ input }) => {
      return await canvaService.getDesign(input.designId);
    }),
});
```

## Step 6: Add Canva Router to Main Router

In `server/routers.ts`, add:

```typescript
import { canvaRouter } from './canva_routers';

export const appRouter = router({
  // ... existing routers
  canva: canvaRouter,
});
```

## Step 7: Create Frontend Component

Create `client/src/components/CanvaDesignGenerator.tsx`:

```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/_core/hooks/useAuth';

export function CanvaDesignGenerator() {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [loading, setLoading] = useState(false);

  const createMaterial = trpc.canva.createStudyMaterial.useMutation();

  const handleCreate = async () => {
    setLoading(true);
    try {
      const result = await createMaterial.mutateAsync({
        title,
        subject,
        topic,
        gradeLevel,
      });
      console.log('Design created:', result);
      // Handle success
    } catch (error) {
      console.error('Error creating design:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Study Material with Canva</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Input
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <Input
          placeholder="Topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <Input
          placeholder="Grade Level"
          value={gradeLevel}
          onChange={(e) => setGradeLevel(e.target.value)}
        />
        <Button onClick={handleCreate} disabled={loading}>
          {loading ? 'Creating...' : 'Create Design'}
        </Button>
      </CardContent>
    </Card>
  );
}
```

## Step 8: Use Cases in Tkrell

### For Students

1. **Create Study Posters** - Generate visual study guides
2. **Make Flashcards** - Create custom flashcards for revision
3. **Design Infographics** - Visualize complex topics
4. **Generate Revision Notes** - Create formatted study materials

### For Teachers

1. **Create Lesson Materials** - Design teaching aids
2. **Generate Worksheets** - Create practice worksheets
3. **Design Certificates** - Create achievement certificates
4. **Make Announcements** - Design class announcements

## Error Handling

```typescript
try {
  const design = await canvaService.createDesign(options);
} catch (error) {
  if (error.response?.status === 401) {
    console.error('Invalid Canva API credentials');
  } else if (error.response?.status === 429) {
    console.error('Rate limit exceeded');
  } else {
    console.error('Unknown error:', error.message);
  }
}
```

## Rate Limiting

Canva API has rate limits:

- **Free Plan:** 100 requests per minute
- **Paid Plan:** Higher limits available

Implement rate limiting in your backend:

```typescript
import rateLimit from 'express-rate-limit';

const canvaLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many Canva requests, please try again later',
});

app.use('/api/canva', canvaLimiter);
```

## Testing

```typescript
// Test creating a design
const design = await canvaService.createDesign({
  title: 'Test Design',
  width: 800,
  height: 600,
});

console.log('Design created:', design.id);

// Test exporting
const exportUrl = await canvaService.exportDesign(design.id, {
  format: 'pdf',
  quality: 'high',
});

console.log('Export URL:', exportUrl);
```

## Troubleshooting

### "Invalid API credentials"

- Verify your API key and secret are correct
- Check that they're set in environment variables
- Regenerate credentials if needed

### "Rate limit exceeded"

- Implement caching to reduce API calls
- Batch requests where possible
- Upgrade Canva plan for higher limits

### "Design creation failed"

- Check that all required parameters are provided
- Verify dimensions are valid
- Check Canva API documentation

## Resources

- **Canva API Docs:** https://www.canva.com/developers/docs
- **API Reference:** https://www.canva.com/developers/api
- **Support:** https://support.canva.com

---

**Last Updated:** November 2025
**Version:** 1.0.0
