import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { Folder } from '../types';

export const foldersController = {
  async list(_req: Request, res: Response) {
    try {
      const folders = await db.listFolders();
      return res.json(folders);
    } catch (err: any) {
      console.error('[FoldersController] list error:', err);
      return res.status(500).json({ error: 'Failed to list folders', message: err.message });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { name, description, color, icon } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Folder name is required' });
      }

      const folder: Omit<Folder, 'updatedAt'> = {
        id: `fld-${uuidv4().slice(0, 8)}`,
        name: name.trim(),
        description: description || '',
        color: color || 'blue',
        icon: icon || 'folder',
      };

      const created = await db.createFolder(folder);
      return res.status(201).json(created);
    } catch (err: any) {
      console.error('[FoldersController] create error:', err);
      return res.status(500).json({ error: 'Failed to create folder', message: err.message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updated = await db.updateFolder(id, updates);

      if (!updated) {
        return res.status(404).json({ error: 'Folder not found' });
      }

      return res.json(updated);
    } catch (err: any) {
      console.error('[FoldersController] update error:', err);
      return res.status(500).json({ error: 'Failed to update folder', message: err.message });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await db.deleteFolder(id);
      return res.status(204).send();
    } catch (err: any) {
      console.error('[FoldersController] delete error:', err);
      return res.status(500).json({ error: 'Failed to delete folder', message: err.message });
    }
  },
};

