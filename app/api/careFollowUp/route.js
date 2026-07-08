import {
  createCareFollowUp,
  updateCareFollowUp,
  deleteCareFollowUp,
  getCareFollowUpById,
  getAllCareFollowUps,
  getFollowUpsByStatus,
  getFollowUpsAssignedTo,
  closeFollowUp,
  getCareFollowUpDashboard
} from '../../services/careFollowUpService';
import { careFollowUpValidator } from '../../validation/careFollowUpValidator';
import { logger } from '../../../utils/logger';
import { NextResponse } from 'next/server';
import { getUserSession } from '../../../utils/generateToken';

export const POST = async (req) => {
  try {
    const user = await getUserSession(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const payload = {
      ...body,
      assignedTo: body.assignedTo || user._id
    };

    // Validate request
    const validation = careFollowUpValidator(payload);
    if (validation !== true) {
      return NextResponse.json({ error: 'Validation failed', details: validation }, { status: 400 });
    }

    const data = await createCareFollowUp(payload);
    return NextResponse.json({ data, success: true }, { status: 201 });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};

export const GET = async (req) => {
  try {
    const user = await getUserSession(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    if (action === 'getById') {
      const id = url.searchParams.get('id');
      if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
      }
      const data = await getCareFollowUpById(id, { churchId: user.church, currentUserId: user._id });
      return NextResponse.json({ data, success: true });
    }

    if (action === 'dashboard') {
      const data = await getCareFollowUpDashboard({ churchId: user.church, currentUserId: user._id });
      return NextResponse.json({ data, success: true });
    }

    if (action === 'getAll') {
      const sortField = url.searchParams.get('sortField') || 'createdAt';
      const sortOrder = url.searchParams.get('sortOrder') || 'desc';
      const status = url.searchParams.get('status') || 'ALL';
      const assignedTo = url.searchParams.get('assignedTo') || 'ALL';
      const priority = url.searchParams.get('priority') || 'ALL';
      const searchQuery = url.searchParams.get('searchQuery') || '';
      const result = await getAllCareFollowUps({
        churchId: user.church,
        currentUserId: user._id,
        page,
        limit,
        sortField,
        sortOrder,
        status,
        assignedTo,
        priority,
        searchQuery
      });
      return NextResponse.json({ ...result, success: true });
    }

    if (action === 'byStatus') {
      const status = url.searchParams.get('status');
      if (!status) {
        return NextResponse.json({ error: 'Status is required' }, { status: 400 });
      }
      const result = await getFollowUpsByStatus(status, {
        churchId: user.church,
        currentUserId: user._id,
        page,
        limit
      });
      return NextResponse.json({ ...result, success: true });
    }

    if (action === 'assignedTo') {
      const userId = url.searchParams.get('userId');
      if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
      }
      const result = await getFollowUpsAssignedTo(userId, {
        churchId: user.church,
        currentUserId: user._id,
        page,
        limit
      });
      return NextResponse.json({ ...result, success: true });
    }

    // Default: get all
    const result = await getAllCareFollowUps({
      churchId: user.church,
      currentUserId: user._id,
      page,
      limit
    });
    return NextResponse.json({ ...result, success: true });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};

export const PUT = async (req) => {
  try {
    const user = await getUserSession(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const body = await req.json();

    if (action === 'close') {
      const data = await closeFollowUp(id, body.note);
      return NextResponse.json({ data, success: true });
    }

    // Default: update
    const data = await updateCareFollowUp(id, body);
    return NextResponse.json({ data, success: true });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};

export const DELETE = async (req) => {
  try {
    const user = await getUserSession(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const data = await deleteCareFollowUp(id);
    return NextResponse.json({ data, success: true });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
