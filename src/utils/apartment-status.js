/* eslint-disable */
// ----------------------------------------------------------------------

export default function getStatusColor(statusId) {
  switch (statusId) {
    case '1':
      return '#4caf50';

    case '2':
    case '4':
      return '#ff9800';

    case '3':
      return '#ff5722';

    default:
      '#fff';
  }
}

export function getDisabledStatusColor(statusId) {
  

  switch (statusId) {
    case '1':
      return '#4caf5066';

    case '2':
    case '4':
      return '#ff572266';

    case '3':
      return '#ff980066';
    case '4':
      return '#80808066';

    default:
      'blue';
  }
}

export function getStatusTitle(statusId) {
  switch (statusId) {
    case '1':
      return 'Свободно';

    case '2':
      return 'Забронировано';

    case '3':
      return 'Продано';

    default:
      '#fff';
  }
}
