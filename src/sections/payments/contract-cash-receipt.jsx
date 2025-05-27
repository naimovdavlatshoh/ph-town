import React from 'react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';

import { Stack } from '@mui/material';

import 'src/sheet.css';

const ContractCashReceipt = React.forwardRef(
  // eslint-disable-next-line react/prop-types
  ({ display, data }, ref) => (
    <div
      ref={ref}
      className="ritz grid-container"
      dir="ltr"
      style={{ display, position: 'absolute', zIndex: -999999 }}
    >
      <Stack
        width={520}
        direction="row"
        justifyContent="space-between"
        style={{ paddingTop: '2rem', paddingLeft: '3.5rem', paddingRight: '1rem' }}
      >
        <span className="s2">{dayjs().format('DD.MM.YYYY HH:mm')}</span>
        <span className="s2">Печать квитанции | {data?.exchangeRate}</span>
      </Stack>
      <table className="waffle" cellSpacing={0} cellPadding={0}>
        <thead style={{ visibility: 'hidden' }}>
          <tr>
            <th className="row-header freezebar-origin-ltr" />
            <th id="1742888030C0" style={{ width: '11px' }} className="column-headers-background">
              A
            </th>
            <th id="1742888030C1" style={{ width: '34px' }} className="column-headers-background">
              {display}
            </th>
            <th id="1742888030C2" style={{ width: '40px' }} className="column-headers-background">
              C
            </th>
            <th id="1742888030C3" style={{ width: '41px' }} className="column-headers-background">
              D
            </th>
            <th id="1742888030C4" style={{ width: '45px' }} className="column-headers-background">
              E
            </th>
            <th id="1742888030C5" style={{ width: '73px' }} className="column-headers-background">
              F
            </th>
            <th id="1742888030C6" style={{ width: '58px' }} className="column-headers-background">
              G
            </th>
            <th id="1742888030C7" style={{ width: '70px' }} className="column-headers-background">
              H
            </th>
            <th id="1742888030C8" style={{ width: '38px' }} className="column-headers-background">
              I
            </th>
            <th id="1742888030C9" style={{ width: '54px' }} className="column-headers-background">
              J
            </th>
            <th id="1742888030C10" style={{ width: '6px' }} className="column-headers-background">
              K
            </th>
            <th id="1742888030C11" style={{ width: '8px' }} className="column-headers-background">
              L
            </th>
            <th id="1742888030C12" style={{ width: '54px' }} className="column-headers-background">
              M
            </th>
            <th id="1742888030C13" style={{ width: '62px' }} className="column-headers-background">
              N
            </th>
            <th id="1742888030C14" style={{ width: '62px' }} className="column-headers-background">
              O
            </th>
            <th id="1742888030C15" style={{ width: '24px' }} className="column-headers-background">
              P
            </th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ height: '10px' }}>
            <th
              id="1742888030R0"
              style={{ height: '10px', visibility: 'hidden' }}
              className="row-headers-background"
            >
              <div className="row-header-wrapper" style={{ lineHeight: '10px' }}>
                1
              </div>
            </th>
            <td className="s0" />
            <td className="s0" />
            <td className="s0" />
            <td className="s0" />
            <td className="s0" />
            <td className="s0" />
            <td className="s0" />
            <td className="s0" />
            <td className="s0" />
            <td className="s0" />
            <td className="s0" />
            <td className="s0" />
            <td className="s0" />
            <td className="s0" />
            <td className="s0" />
            <td className="s0" />
          </tr>
          <tr style={{ height: '19px' }}>
            <th
              id="1742888030R1"
              style={{ height: '19px', visibility: 'hidden' }}
              className="row-headers-background"
            >
              <div className="row-header-wrapper" style={{ lineHeight: '19px' }}>
                2
              </div>
            </th>

            <td className="s1" />
            <td className="s2" colSpan={6}>
              ООО &quot;`SAMARQAND CHINORI&quot;`
            </td>
            <td className="s1" />
            <td className="s1" />
            <td className="s3" />
            <td className="s4" />
            <td className="s4" />
            <td className="s5" colSpan={4}>
              ООО &quot;`SAMARQAND CHINORI&quot;`
            </td>
          </tr>
          <tr style={{ height: '13px' }}>
            <th
              id="1742888030R2"
              style={{ height: '13px', visibility: 'hidden' }}
              className="row-headers-background"
            >
              <div className="row-header-wrapper" style={{ lineHeight: '13px' }}>
                3
              </div>
            </th>
            <td className="s0" />
            <td className="s6 softmerge">
              <div className="softmerge-inner" style={{ width: '231px', left: '-1px' }}>
                предприятие, организация
              </div>
            </td>
            <td className="s7" />
            <td className="s7" />
            <td className="s7" />
            <td className="s8" />
            <td className="s8" />
            <td className="s0" />
            <td className="s0" />
            <td className="s0" />
            <td className="s9" />
            <td className="s4" />
            <td className="s6 softmerge">
              <div className="softmerge-inner" style={{ width: '176px', left: '-1px' }}>
                предприятие, организация
              </div>
            </td>
            <td className="s7" />
            <td className="s8" />
            <td className="s8" />
          </tr>
          <tr style={{ height: '16px' }}>
            <th
              id="1742888030R3"
              style={{ height: '16px', visibility: 'hidden' }}
              className="row-headers-background"
            >
              <div className="row-header-wrapper" style={{ lineHeight: '16px' }}>
                4
              </div>
            </th>
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s3" />
            <td className="s10" colSpan={2} />
            <td className="s4" />
            <td className="s4" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
          </tr>
          <tr style={{ height: '16px' }}>
            <th
              id="1742888030R4"
              style={{ height: '16px', visibility: 'hidden' }}
              className="row-headers-background"
            >
              <div className="row-header-wrapper" style={{ lineHeight: '16px' }}>
                5
              </div>
            </th>
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s4" />
            <td className="s4" />
            <td className="s11" colSpan={3}>
              КВИТАНЦИЯ
            </td>
            <td className="s12" />
          </tr>
          <tr style={{ height: '24px' }}>
            <th
              id="1742888030R5"
              style={{ height: '24px', visibility: 'hidden' }}
              className="row-headers-background"
            >
              <div className="row-header-wrapper" style={{ lineHeight: '24px' }}>
                6
              </div>
            </th>
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s13" colSpan={5}>
              ПРИХОДНЫЙ КАССОВЫЙ ОРДЕР №
            </td>
            <td className="s12">{data?.id}</td>
            <td className="s1" />
            <td className="s4" />
            <td className="s4" />
            <td className="s14" colSpan={3}>
              к приходному кассовому ордеру
            </td>
            <td className="s1" />
          </tr>
          <tr style={{ height: '6px' }}>
            <th
              id="1742888030R6"
              style={{ height: '6px', visibility: 'hidden' }}
              className="row-headers-background"
            >
              <div className="row-header-wrapper" style={{ lineHeight: '6px' }}>
                7
              </div>
            </th>
            <td className="s0" />
            <td className="s0" />
            <td className="s0" />
            <td className="s0" />
            <td className="s0" />
            <td className="s15" />
            <td className="s15" />
            <td className="s15" />
            <td className="s0" />
            <td className="s0" />
            <td className="s9" />
            <td className="s4" />
            <td className="s0" />
            <td className="s16" rowSpan={2}>
              №
            </td>
            <td className="s17" rowSpan={2}>
              {data?.id}
            </td>
            <td className="s0" />
          </tr>
          <tr style={{ height: '16px' }}>
            <th
              id="1742888030R7"
              style={{ height: '16px', visibility: 'hidden' }}
              className="row-headers-background"
            >
              <div className="row-header-wrapper" style={{ lineHeight: '16px' }}>
                8
              </div>
            </th>
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s4" />
            <td className="s18">Число</td>
            <td className="s18">Месяц</td>
            <td className="s19">Год</td>
            <td className="s1" />
            <td className="s1" />
            <td className="s4" />
            <td className="s4" />
            <td className="s1" />
            <td className="s1" />
          </tr>
          <tr style={{ height: '16px' }}>
            <th
              id="1742888030R8"
              style={{ height: '16px', visibility: 'hidden' }}
              className="row-headers-background"
            >
              <div className="row-header-wrapper" style={{ lineHeight: '16px' }}>
                9
              </div>
            </th>
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s4" />
            <td className="s18">{data?.created_day}</td>
            <td className="s18">{data?.created_month}</td>
            <td className="s19">{data?.created_year}</td>
            <td className="s1" />
            <td className="s1" />
            <td className="s4" />
            <td className="s4" />
            <td className="s20 softmerge">
              <div className="softmerge-inner" style={{ width: '114px', left: '-1px' }}>
                Принято от
              </div>
            </td>
            <td className="s21" />
            <td className="s21" />
            <td className="s1" />
          </tr>
          <tr style={{ height: '7px' }}>
            <th
              id="1742888030R9"
              style={{ height: '7px', visibility: 'hidden' }}
              className="row-headers-background"
            >
              <div className="row-header-wrapper" style={{ lineHeight: '7px' }}>
                10
              </div>
            </th>
            <td className="s0" />
            <td className="s15" />
            <td className="s15" />
            <td className="s15" />
            <td className="s15" />
            <td className="s15" />
            <td className="s15" />
            <td className="s15" />
            <td className="s15" />
            <td className="s15" />
            <td className="s9" />
            <td className="s4" />
            <td className="s0" />
            <td className="s0" />
            <td className="s0" />
            <td className="s0" />
          </tr>
          <tr style={{ height: '52px' }}>
            <th
              id="1742888030R10"
              style={{ height: '52px', visibility: 'hidden' }}
              className="row-headers-background"
            >
              <div className="row-header-wrapper" style={{ lineHeight: '52px' }}>
                11
              </div>
            </th>
            <td className="s9" />
            <td className="s22">№</td>
            <td className="s23" colSpan={2}>
              Корреспонди-рующий счет.субсчет
            </td>
            <td className="s24" colSpan={2}>
              Шифр аналити- ческого учета
              <br />
            </td>
            <td className="s24" colSpan={2}>
              Сумма
              <br />
              <br />
            </td>
            <td className="s24" colSpan={2}>
              Шифр целевого назначения
              <br />
            </td>
            <td className="s9" />
            <td className="s4" />
            <td className="s25" colSpan={3}>
              {data?.client}
            </td>
            <td className="s0" />
          </tr>
          <tr style={{ height: '16px' }}>
            <th
              id="1742888030R11"
              style={{ height: '16px', visibility: 'hidden' }}
              className="row-headers-background"
            >
              <div className="row-header-wrapper" style={{ lineHeight: '16px' }}>
                12
              </div>
            </th>
            <td className="s9" />
            <td className="s26">1</td>
            <td className="s18" colSpan={2} />
            <td className="s18" colSpan={2} />
            <td className="s27" colSpan={2}>
              {data?.payment}
            </td>
            <td className="s28" colSpan={2} />
            <td className="s9" />
            <td className="s4" />
            <td className="s20 softmerge">
              <div className="softmerge-inner" style={{ width: '114px', left: '-1px' }}>
                Основание
              </div>
            </td>
            <td className="s8" />
            <td className="s8" />
            <td className="s0" />
          </tr>
          <tr style={{ height: '0px' }}>
            <th
              id="1742888030R12"
              style={{ height: '0px', visibility: 'hidden' }}
              className="row-headers-background"
            >
              <div className="row-header-wrapper" style={{ lineHeight: '0px' }}>
                13
              </div>
            </th>
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s4" />
            <td className="s4" />
            <td className="s29" colSpan={3}>
              ИНВЕСТИЦИОННЫЙ ВЗНОС В СТРОИТЕЛЬСТВО ЖИЛОГО ДОМА по адресу: г.Самарканд ,Беруний
              кучаси, 117-уй. по Договору № {data?.contract_number} от {data?.contract_created_at}
            </td>
            <td className="s1" />
          </tr>
          <tr style={{ height: '0px' }}>
            <th
              id="1742888030R13"
              style={{ height: '0px', visibility: 'hidden' }}
              className="row-headers-background"
            >
              <div className="row-header-wrapper" style={{ lineHeight: '0px' }}>
                14
              </div>
            </th>
            <td className="s1" />
            <td className="s1" colSpan={2}>
              Принято от:
            </td>
            <td className="s31" colSpan={7}>
              {data?.client}
            </td>
            <td className="s4" />
            <td className="s4" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
          </tr>
          <tr style={{ height: '26px' }}>
            <th
              id="1742888030R14"
              style={{ height: '26px', visibility: 'hidden' }}
              className="row-headers-background"
            >
              <div className="row-header-wrapper" style={{ lineHeight: '26px' }}>
                15
              </div>
            </th>
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s4" />
            <td className="s4" />
            <td className="s32" colSpan={3} rowSpan={2}>
              {data?.payment_text} сум тийин
            </td>
            <td className="s33" />
          </tr>
          <tr style={{ height: '72px' }}>
            <th
              id="1742888030R15"
              style={{ height: '72px', visibility: 'hidden' }}
              className="row-headers-background"
            >
              <div className="row-header-wrapper" style={{ lineHeight: '72px' }}>
                16
              </div>
            </th>
            <td className="s1" />
            <td className="s20 softmerge">
              <div className="softmerge-inner" style={{ width: '72px', left: '-1px' }}>
                Основание
              </div>
            </td>
            <td className="s21" />
            <td className="s34" colSpan={7}>
              ИНВЕСТИЦИОННЫЙ ВЗНОС В СТРОИТЕЛЬСТВО ЖИЛОГО ДОМА по адресу: г.Самарканд ,Беруний
              кучаси, 117-уй. по Договору № {data?.contract_number} от {data?.contract_created_at}
            </td>
            <td className="s4" />
            <td className="s4" />
            <td className="s33" />
          </tr>
          <tr style={{ height: '16px' }}>
            <th
              id="1742888030R16"
              style={{ height: '16px', visibility: 'hidden' }}
              className="row-headers-background"
            >
              <div className="row-header-wrapper" style={{ lineHeight: '16px' }}>
                17
              </div>
            </th>
            <td className="s1" />
            <td className="s35" />
            <td className="s35" />
            <td className="s35" />
            <td className="s35" />
            <td className="s35" />
            <td className="s35" />
            <td className="s35" />
            <td className="s35" />
            <td className="s35" />
            <td className="s4" />
            <td className="s4" />
            <td className="s36" colSpan={3}>
              {data?.payment}
            </td>
            <td className="s33" />
          </tr>
          <tr style={{ height: '24px' }}>
            <th
              id="1742888030R17"
              style={{ height: '24px', visibility: 'hidden' }}
              className="row-headers-background"
            >
              <div className="row-header-wrapper" style={{ lineHeight: '24px' }}>
                18
              </div>
            </th>
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s4" />
            <td className="s4" />
            <td className="s37">{data?.created_day}</td>
            <td className="s38">{data?.created_month_text}</td>
            <td className="s39">{data?.created_year} год</td>
            <td className="s1" />
          </tr>
          <tr style={{ height: '44px' }}>
            <th
              id="1742888030R18"
              style={{ height: '44px', visibility: 'hidden' }}
              className="row-headers-background"
            >
              <div className="row-header-wrapper" style={{ lineHeight: '44px' }}>
                19
              </div>
            </th>
            <td className="s1" />
            <td className="s40" colSpan={9}>
              {data?.payment_text} сум тийин
            </td>
            <td className="s4" />
            <td className="s4" />
            <td className="s41">М.П.</td>
            <td className="s42" colSpan={2}>
              За квартиру
            </td>
            <td className="s1" />
          </tr>
          <tr style={{ height: '89px' }}>
            <th
              id="1742888030R19"
              style={{ height: '89px', visibility: 'hidden' }}
              className="row-headers-background"
            >
              <div className="row-header-wrapper" style={{ lineHeight: '89px' }}>
                20
              </div>
            </th>
            <td className="s1" />
            <td className="s41" colSpan={2}>
              Приложение
            </td>
            <td className="s43" colSpan={7}>
              {data?.client} паспорт серии {data?.passport} выдан {data?.given_by} от{' '}
              {data?.date_of_issue} до {data?.expire_date} дата рождения {data?.date_of_birth}{' '}
              адрес: {data?.address}
            </td>
            <td className="s4" />
            <td className="s4" />
            <td className="s41" colSpan={3}>
              Получил кассир
            </td>
            <td className="s1" />
          </tr>
          <tr style={{ height: '16px' }}>
            <th
              id="1742888030R20"
              style={{ height: '16px', visibility: 'hidden' }}
              className="row-headers-background"
            >
              <div className="row-header-wrapper" style={{ lineHeight: '16px' }}>
                21
              </div>
            </th>
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s1" />
            <td className="s4" />
            <td className="s4" />
            <td className="s20 softmerge">
              <div className="softmerge-inner" style={{ width: '114px', left: '-1px' }}>
                {data?.operator}
              </div>
            </td>
            <td className="s21" />
            <td className="s21" />
            <td className="s1" />
          </tr>
          <tr style={{ height: '23px' }}>
            <th
              id="1742888030R21"
              style={{ height: '23px', visibility: 'hidden' }}
              className="row-headers-background"
            >
              <div className="row-header-wrapper" style={{ lineHeight: '23px' }}>
                22
              </div>
            </th>
            <td className="s0" />
            <td className="s20 softmerge">
              <div className="softmerge-inner" style={{ width: '289px', left: '-1px' }}>
                Получил кассир________________{data?.operator}
              </div>
            </td>
            <td className="s7" />
            <td className="s7" />
            <td className="s7" />
            <td className="s7" />
            <td className="s8" />
            <td className="s8" />
            <td className="s0" />
            <td className="s0" />
            <td className="s9" />
            <td className="s4" />
            <td className="s44 softmerge">
              <div className="softmerge-inner" style={{ width: '176px', left: '-1px' }}>
                _____________________
              </div>
            </td>
            <td className="s45" />
            <td className="s46" />
            <td className="s8" />
          </tr>
        </tbody>
      </table>
    </div>
  )
);

export default ContractCashReceipt;

ContractCashReceipt.propTypes = {
  data: PropTypes.object,
};
