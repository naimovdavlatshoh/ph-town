/* eslint-disable no-nested-ternary */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/extensions */
// eslint-disable-next-line import/no-extraneous-dependencies
import * as React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { pdfjs } from 'react-pdf';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as docx from 'docx-preview';
// eslint-disable-next-line import/no-extraneous-dependencies
import PizZipUtils from 'pizzip/utils';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useState, useEffect } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies

import moment from 'moment';

import { Stack } from '@mui/system';
import { Button } from '@mui/material';
import Slide from '@mui/material/Slide';
import { LoadingButton } from '@mui/lab';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useGetContracts } from 'src/api/contract';

import Iconify from 'src/components/iconify';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@/build/pdf.worker.js`;

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

function loadFile(url, callback) {
  PizZipUtils.getBinaryContent(url, callback);
}

export default function ContractPreivewFullscreenDialog({
  contractNumber,
  mode,
  open,
  handleClose,
  blob,
  data,
  isPrint = false,
}) {
  const router = useRouter();
  const [html, setHtml] = useState('');
  const [comments, setComments] = useState([]);

  const { contractsLoading, create, createWithPlan, update, updateWithPlan } = useGetContracts();
  const [visibleAppBar, setVisibleAppBar] = useState(true);
  const [marginTop, setMarginTop] = useState(50);

  console.log(data);


  const handleCreate = () => {
    if (data.paymentType === 'Наличными') {
      const newData = {
        created_at: moment(data?.contract_date).valueOf(),
        client_id: data?.client?.client_id,
        contract_type: 0,
        contract_number: data?.contract_number,
        apartment_id: data?.apartment?.apartment_id,
        apartment_area: data?.apartment?.apartment_area,
        price_square_meter: data?.apartment?.price_square_meter,
        total_price: data?.totalAmount,
        initial_payment: parseFloat(data?.initialPayment?.replace(/,/g, '')),
        comments: data?.comments,
        is_barter: data.is_barter ? 1 : 0,
      };

      create(newData, () => {
        onClose();
        router.push(paths.dashboard.contracts.root);
      });
    } else {
      const newData = {
        created_at: moment(data?.contract_date).valueOf(),
        date_type: data?.monthlyPaymentAuto === 'Автоматически' ? 1 : 2,
        client_id: data?.client?.client_id,
        contract_type: 1,
        contract_number: data?.contract_number,
        apartment_id: data?.apartment?.apartment_id,
        apartment_area: data?.apartment?.apartment_area,
        price_square_meter: data?.apartment?.price_square_meter,
        total_price: data?.totalAmount,
        initial_payment: parseFloat(data?.initialPayment?.replace(/,/g, '')),
        monthly_fee: data?.monthly_fee,
        payment_day: data?.mounthPayList?.map((mp) =>
          data?.monthlyPaymentAuto === 'Автоматически'
            ? moment(mp.date).format('DD-MM-YYYY')
            : mp.date
        ),
        comments: data?.comments,
        is_barter: data.is_barter ? 1 : 0,
      };

      createWithPlan(newData, () => {
        onClose();
        router.push(paths.dashboard.contracts.root);
      });
    }
  };

  const handleUpdate = () => {
    if (data.paymentType === 'Наличными') {
      const newData = {
        contract_id: data?.contract_id,
        created_at: moment(data?.contract_date).valueOf(),
        client_id: data?.client?.client_id,
        contract_type: 0,
        contract_number: data?.contract_number,
        apartment_id: data?.apartment?.apartment_id,
        apartment_area: data?.apartment?.apartment_area,
        price_square_meter: data?.apartment?.price_square_meter,
        total_price: data?.totalAmount,
        initial_payment: parseFloat(data?.initialPayment?.replace(/,/g, '')),
        comments: data?.comments,
        is_barter: data.is_barter ? 1 : 0,
      };

      update(newData, () => {
        onClose();
        router.push(paths.dashboard.contracts.root);
      });
    } else {
      const newData = {
        contract_id: data?.contract_id,
        created_at: moment(data?.contract_date).valueOf(),
        date_type: data?.monthlyPaymentAuto === 'Автоматически' ? 1 : 2,
        client_id: data?.client?.client_id,
        contract_type: 1,
        contract_number: data?.contract_number,
        apartment_id: data?.apartment?.apartment_id,
        apartment_area: data?.apartment?.apartment_area,
        price_square_meter: data?.apartment?.price_square_meter,
        total_price: data?.totalAmount,
        initial_payment: parseFloat(data?.initialPayment?.replace(/,/g, '')),
        monthly_fee: data?.monthly_fee,
        payment_day: data?.mounthPayList?.map((mp) =>
          moment(mp.date).isValid()
            ? moment(mp.date).format('DD-MM-YYYY')
            : moment(mp.date, 'DD-MM-YYYY').format('DD-MM-YYYY')
        ),
        comments: data?.comments,
        is_barter: data.is_barter ? 1 : 0,
      };

      // updateWithPlan(newData, () => {
      //   onClose();
      //   router.push(paths.dashboard.contracts.root);
      // });
    }
  };

  const onClose = () => {
    if (!contractsLoading) {
      handleClose();
    }
  };

  const onDownload = () => {
    saveFile(`контракт-№${contractNumber}.docx`, blob);
  };

  // Обработчик события при открытии окна печати
  window.addEventListener('beforeprint', () => {
    document.querySelector('.docx-wrapper').style.padding = 0;
    setMarginTop(0);
    setVisibleAppBar(false);
  });

  // Обработчик события при закрытии окна печати
  window.addEventListener('afterprint', () => {
    document.querySelector('.docx-wrapper').style.padding = '30px';
    setMarginTop(50);
    setVisibleAppBar(true);
  });

  useEffect(() => {
    if (blob) {
      const container = document.getElementById('panel-section');

      if (container) {
        const url = URL.createObjectURL(blob);
        fetch(url).then((res) => {
          const template = res.arrayBuffer();
          docx.renderAsync(template, container).then((x) => {
            if (isPrint) {
              setMarginTop(0);
              setVisibleAppBar(false);
              setTimeout(() => window.print(), 0);
            }
          });
        });

        URL.revokeObjectURL(url);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blob]);

  return (
    <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
      <AppBar
        sx={{
          background: '#fff',
          boxShadow: '0px 4px 10px 0px rgba(34, 60, 80, 0.2)',
          '@media print': {
            display: 'none',
          },
          display: !visibleAppBar ? 'none' : '',
        }}
      >
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
            <Iconify icon="material-symbols:close" />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="overline" component="div">
            ДОГОВОР № {data?.contract_number || contractNumber}
          </Typography>

          {mode === 'create' ? (
            <Stack direction="row" gap={1}>
              <Button autoFocus color="inherit" onClick={handleClose}>
                Назад
              </Button>
              <LoadingButton
                autoFocus
                color="primary"
                onClick={handleCreate}
                loading={contractsLoading}
              >
                Сохранить
              </LoadingButton>
            </Stack>
          ) : mode === 'update' ? (
            <Stack direction="row" gap={1}>
              <Button autoFocus color="inherit" onClick={handleClose}>
                Назад
              </Button>
              <LoadingButton
                autoFocus
                color="primary"
                onClick={handleUpdate}
                loading={contractsLoading}
              >
                Обновить
              </LoadingButton>
            </Stack>
          ) : (
            <Stack direction="row" alignItems="center" gap={0.5}>
              <IconButton autoFocus color="inherit" onClick={onDownload}>
                <Iconify icon="material-symbols:download" />
              </IconButton>
              <IconButton
                autoFocus
                color="inherit"
                onClick={() => {
                  setMarginTop(0);
                  setVisibleAppBar(false);
                  setTimeout(() => window.print(), 0);
                }}
              >
                <Iconify icon="material-symbols:print" />
              </IconButton>
            </Stack>
          )}
        </Toolbar>
      </AppBar>
      <div
        id="panel-section"
        style={{
          height: '800px',
          overflowY: 'visible',
          marginTop,
        }}
      />
    </Dialog>
  );
}

function saveFile(filename, blob) {
  // see: https://stackoverflow.com/questions/19327749/javascript-blob-filename-without-link

  // get downloadable url from the blob

  // Предполагается, что у вас есть объект blob, содержащий данные ZIP-архива

  const blobUrl = URL.createObjectURL(blob);

  // create temp link element
  let link = document.createElement('a');
  link.download = filename;
  link.href = blobUrl;

  // use the link to invoke a download
  document.body.appendChild(link);
  link.click();

  // remove the link
  setTimeout(() => {
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
    link = null;
  }, 0);
}

ContractPreivewFullscreenDialog.propTypes = {
  mode: PropTypes.string.isRequired,
  contractNumber: PropTypes.string,
  open: PropTypes.bool.isRequired,
  data: PropTypes.func,
  handleClose: PropTypes.func.isRequired,
  blob: PropTypes.any,
  isPrint: PropTypes.bool,
};
