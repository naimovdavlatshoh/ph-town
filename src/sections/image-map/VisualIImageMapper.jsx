// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import ImageMapper from 'react-img-mapper';
import React, { useMemo, useState, useEffect, useCallback } from 'react';

import { Button } from '@mui/material';
import { Box, Stack } from '@mui/system';

import { useGetApartmentsByFloor } from 'src/api/apartment';
import { useGetBlockVisual, useGetProjectVisual } from 'src/api/visual';

import Iconify from 'src/components/iconify';
import { LoadingScreen } from 'src/components/loading-screen';

import TooltipVisual from './TooltipVisual';
import ApartmentList from './apartment-list';

const VisualImageMapper = ({ projectId }) => {
  const [loading, setLoading] = useState(true);
  const [selectedElem, setSelectedElem] = useState({
    type: 'project',
    id: projectId,
  });
  const [historyElems, setHistoryElems] = useState({
    project: {
      type: 'project',
      id: projectId,
    },
    block: null,
    floor: null,
  });
  const [sizeImage, setSizeImage] = useState();
  const { projectVisual, projectVisualLoading } = useGetProjectVisual(
    selectedElem.type === 'project' ? selectedElem.id : ''
  );
  const { apartments, apartmentsLoading } = useGetApartmentsByFloor(
    selectedElem.type === 'floor' ? selectedElem.id : ''
  );
  const { blockVisual, blockVisualLoading } = useGetBlockVisual(
    selectedElem.type === 'block' ? selectedElem.id : ''
  );
  const [areas, setAreas] = useState([]);
  const [img, setImg] = useState('');

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [focusedObject, setFocusedObject] = useState();

  useEffect(() => {
    if (selectedElem.type === 'project') {
      if (projectVisual) {
        fetchImage(projectVisual?.img);
        setAreas(projectVisual?.areas);
        setImg(projectVisual?.img);
      }
    }

    if (selectedElem.type === 'block') {
      if (blockVisual) {
        fetchImage(blockVisual?.img);
        setAreas(blockVisual?.areas);

        setImg(blockVisual?.img);

        setHistoryElems((h) => ({
          ...h,
          block: selectedElem,
        }));
      }
    }

    if (selectedElem.type === 'floor') {
      setHistoryElems((h) => ({
        ...h,
        floor: selectedElem,
      }));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectVisual, blockVisual, selectedElem]);

  const fetchImage = useCallback(async (url) => {
    setLoading(true);
    const { width, height } = await loadImage(url);

    setSizeImage({ width, height });

    setLoading(false);
  }, []);

  const MAP = {
    name: 'my-map',
    // GET JSON FROM BELOW URL AS AN EXAMPLE
    areas,
  };

  const handleMouseMove = useMemo(
    () => (_a, _b, e) => {
      // // Получаем координаты изображения относительно окна браузера
      // const imageBounds = e.target.getBoundingClientRect();
      // // Получаем координаты курсора относительно изображения
      // const xRelativeToImage = e.clientX - imageBounds.left;
      // const yRelativeToImage = e.clientY - imageBounds.top;
      // Обновляем состояние

      setPosition({ x: e.nativeEvent.offsetX - 30, y: e.nativeEvent.offsetY - 30 });
    },
    []
  );

  // console.log('POSITION', position);

  const handleBackTo = () => {
    if (selectedElem.type === 'floor') {
      setSelectedElem(historyElems.block);
      setHistoryElems((h) => ({ ...h, floor: null }));
    }

    if (selectedElem.type === 'block') {
      setSelectedElem(historyElems.project);
      setHistoryElems((h) => ({ ...h, block: null }));
    }
  };

  return (
    <Box>
      {loading || projectVisualLoading || blockVisualLoading || apartmentsLoading ? (
        <Stack sx={{ height: 'calc(100vh - 400px)' }} justifyContent="center" alignItems="center">
          <LoadingScreen title="Загрузка визуализации..." />
        </Stack>
      ) : (
        // eslint-disable-next-line no-unsafe-optional-chaining
        <div style={{ position: 'relative' }}>
          {selectedElem.type === 'floor' ? (
            <ApartmentList apartments={apartments} />
          ) : (
            <ImageMapper
              src={img}
              map={MAP}
              parentWidth={window.innerWidth * 0.8}
              responsive
              onMouseMove={handleMouseMove}
              onMouseLeave={() => {
                setFocusedObject(null);
                setIsDragging(false);
              }}
              onMouseEnter={(obj) => {
                setFocusedObject(obj);

                setIsDragging(true);
              }}
              onClick={(el) => {
                setIsDragging(false);

                if (selectedElem.type === 'project') {
                  setSelectedElem({
                    type: 'block',
                    id: el.block_id,
                  });
                }

                if (selectedElem.type === 'block') {
                  setSelectedElem({
                    type: 'floor',
                    id: el.floor_id,
                  });
                }
              }}
            />
          )}
          <TooltipVisual
            type={selectedElem.type}
            title={focusedObject?.title}
            display={isDragging ? 'flex' : 'none'}
            left={position.x + 30}
            top={position.y + 30}
          />

          {selectedElem.type !== 'project' && (
            <Button
              onClick={handleBackTo}
              variant="contained"
              color="primary"
              sx={{
                position: 'absolute',
                left: '2rem',
                top: '2rem',
                zIndex: 9999,
              }}
              startIcon={<Iconify icon="ep:back" />}
            >
              Назад
            </Button>
          )}
        </div>
      )}
    </Box>
  );
};
export default VisualImageMapper;

const loadImage = async (url) => {
  const response = await fetch(url);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
};

const loadAreas = async (url) => {
  const response = await fetch(url);
  const result = await response.json();

  return result;
};

VisualImageMapper.propTypes = {
  projectId: PropTypes.string,
};
