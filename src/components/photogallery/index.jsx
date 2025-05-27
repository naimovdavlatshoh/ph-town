import * as React from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useEffect, useCallback } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Inline from 'yet-another-react-lightbox/plugins/inline';

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

const makeSlides = (images) =>
  images?.map((photo) => {
    const width = photo?.width;
    const height = photo?.height;
    return {
      src: photo?.url,
      width,
      height,
      srcSet: [
        {
          src: photo?.url,
          width,
          height,
        },
      ],
    };
  });

export default function PhotoGallery({ images }) {
  const [open, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState(0);
  const [slides, setSlides] = React.useState([]);

  useEffect(() => {
    loadImagesWithDimensions(images);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  const loadImagesWithDimensions = useCallback(async (imgs) => {
    const imagesWithDimensions = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const image of imgs) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const dimensions = await loadImage(image?.webp_file_path);
        imagesWithDimensions.push({ url: image?.webp_file_path, ...dimensions });
      } catch (error) {
        console.error(`Failed to load image at ${image?.webp_file_path}:`, error);
      }
    }

    setSlides(makeSlides(imagesWithDimensions));
  }, []);

  const toggleOpen = (state) => () => setOpen(state);

  const updateIndex = ({ current }) => setIndex(current);

  return (
    <>
      <Lightbox
        index={index}
        slides={slides}
        plugins={[Inline]}
        on={{
          view: updateIndex,
          click: toggleOpen(true),
        }}
        carousel={{
          padding: 0,
          spacing: 0,
          imageFit: 'cover',
        }}
        inline={{
          style: {
            width: '100%',
            maxWidth: '200px',
            aspectRatio: '3 / 2',
          },
        }}
      />

      <Lightbox
        open={open}
        close={toggleOpen(false)}
        index={index}
        slides={slides}
        on={{ view: updateIndex }}
        animation={{ fade: 0 }}
        controller={{ closeOnPullDown: true, closeOnBackdropClick: true }}
      />
    </>
  );
}

PhotoGallery.propTypes = {
  images: PropTypes.array,
};
