import { NextResponse } from 'next/server';

export const GET = async (req) => {
  try {
    const apiKey = req.headers.get('nj-api-key');
    const clientId = req.headers.get('x-nj-client-id');
    const authorization = req.headers.get('authorization');

    console.log('=== DEBUG HEADERS (GET) ===');
    console.log('nj-api-key:', apiKey);
    console.log('nj-client-id:', clientId);
    console.log('authorization:', authorization);
    console.log('===========================');

    return NextResponse.json({
      message: 'Check server logs for header values',
      headers: {
        'nj-api-key': apiKey || 'Not received',
        'nj-client-id': clientId || 'Not received',
        'authorization': authorization ? 'Present' : 'Not received'
      }
    });
  } catch (error) {
    console.error('Debug Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

export const POST = async (req) => {
  try {
    const apiKey = req.headers.get('nj-api-key');
    const clientId = req.headers.get('nj-client-id');
    const authorization = req.headers.get('authorization');
    const body = await req.json();

    console.log('=== DEBUG HEADERS (POST) ===');
    console.log('nj-api-key:', apiKey);
    console.log('nj-client-id:', clientId);
    console.log('authorization:', authorization);
    console.log('Body:', body);
    console.log('=============================');

    return NextResponse.json({
      message: 'Check server logs for header values',
      headers: {
        'nj-api-key': apiKey || 'Not received',
        'nj-client-id': clientId || 'Not received',
        'authorization': authorization ? 'Present' : 'Not received'
      },
      body: body
    });
  } catch (error) {
    console.error('Debug Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
