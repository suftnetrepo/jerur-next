import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory
} from '../../services/categoryServices';
import { logger } from '@/utils/logger';
import { NextResponse } from 'next/server';

export const GET = async (req) => {
  try {
    const url = new URL(req.url);
    const sortField = url.searchParams.get('sortField');
    const sortOrder = url.searchParams.get('sortOrder');
    const searchQuery = url.searchParams.get('searchQuery');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const data = await getAllCategories({ page, limit, sortField, sortOrder, searchQuery });
    return NextResponse.json({ data, success: true }, { status: 200 });
  } catch (error) {
    logger.log(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};

export const POST = async (req) => {
  try {
    const body = await req.json();
    const data = await createCategory(body);
    return NextResponse.json({ data, success : true }, { status: 200 });
  } catch (error) {
    logger.log(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};

export const PUT = async (req) => {
  try {
    const body = await req.json();
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const data = await updateCategory(id, body);
    return NextResponse.json({ data, success: true }, { status: 200 });
  } catch (error) {
    logger.log(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};

export const DELETE = async (req) => {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const data = await deleteCategory(id);
    return NextResponse.json({ data, success: true }, { status: 200 });
  } catch (error) {
    logger.log(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
