import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { Tooltip, Checkbox } from '@mui/material';

import Iconify from 'src/components/iconify';
import RHFPhoneField from 'src/components/hook-form/rhf-phone-field';

// ----------------------------------------------------------------------

export default function ClientPhonesListForm() {
  const { control, setValue, watch, resetField } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'phones',
  });

  const values = watch();

  const handleAdd = () => {
    append({
      phone: '',
      isMain: false,
    });
  };

  const handleRemove = (index) => {
    remove(index);
  };

  return (
    <>
      <Stack spacing={3}>
        {fields.map((item, index) => (
          <Stack key={item.id} alignItems="flex-end" spacing={0.5}>
            <Stack direction="row" spacing={1} sx={{ width: 1 }}>
              <RHFPhoneField name={`phones[${index}].phone`} label="Номер телефона" />
              <Tooltip title="Сделать основным?">
                <Controller
                  name={`phones[${index}].isMain`}
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Checkbox
                      checked={field.value}
                      {...field}
                      disabled={values.phones.filter((phone) => phone.isMain).length === 1}
                    />
                  )}
                />
              </Tooltip>
            </Stack>
            <Button
              size="small"
              color="error"
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              onClick={() => handleRemove(index)}
            >
              Удалить
            </Button>
          </Stack>
        ))}
      </Stack>

      <Divider sx={{ my: 1, borderStyle: 'dashed' }} />

      <Stack
        spacing={3}
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-end', md: 'center' }}
      >
        <Button
          size="small"
          color="primary"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleAdd}
          sx={{ flexShrink: 0 }}
        >
          Добавить номер
        </Button>
      </Stack>
    </>
  );
}
