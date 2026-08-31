import { validate } from 'class-validator';
import { PropertiesInquiry } from './property.input';

describe('PropertiesInquiry validation', () => {
  it('allows empty search filters when pagination is valid', async () => {
    const dto = Object.assign(new PropertiesInquiry(), {
      page: 1,
      limit: 10,
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });
});
