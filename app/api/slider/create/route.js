import { addSlider } from '../../../services/sliderService';
import { logger } from '../../../../utils/logger';
import { NextResponse } from 'next/server';
import { getUserSession } from '../../../../utils/generateToken';
import { parseSliderFormData } from '../../shared/parseSliderFormData';

export const POST = async (req) => {
  try {
    const user = await getUserSession(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await parseSliderFormData(req);
    const data = await addSlider(user.church, body);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};