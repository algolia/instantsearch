import { liteClient as algoliasearch } from 'algoliasearch/lite';
import {
  CloseIconComponent,
  Pragma,
  ChevronLeftIconComponent,
  ChevronRightIconComponent,
  UserClientSideTools,
  ClientSideToolComponentProps,
  createButtonComponent,
} from 'instantsearch-ui-components';
import { Hit } from 'instantsearch.js';
import { Eye, Heart } from 'lucide-react';
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  createElement,
  createContext,
  useContext,
} from 'react';
import {
  Configure,
  Highlight,
  Hits,
  InstantSearch,
  Pagination,
  RefinementList,
  SearchBox,
  TrendingItems,
  Carousel,
  Chat,
  createDefaultTools,
  SearchIndexToolType,
  RecommendToolType,
} from 'react-instantsearch';

import { Panel } from './Panel';

import 'instantsearch.css/themes/satellite.css';

import './App.css';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const CarouselContext = createContext<Hit[]>([]);

const Button = createButtonComponent({
  createElement: createElement as Pragma,
});

interface SelectedProduct {
  product: Hit;
  items: Hit[];
  currentIndex: number;
}

interface ProductModalProps {
  selectedProduct: SelectedProduct | null;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}

function ProductModal({
  selectedProduct,
  onClose,
  onNavigate,
}: ProductModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  const product = selectedProduct?.product;
  const items = selectedProduct?.items || [];
  const currentIndex = selectedProduct?.currentIndex ?? -1;

  const canNavigatePrev = currentIndex > 0;
  const canNavigateNext = currentIndex < items.length - 1;

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
      previousActiveElementRef.current?.focus();
    }, 200);
  }, [onClose]);

  const handleNavigate = useCallback(
    (direction: 'prev' | 'next') => {
      if (direction === 'prev' && canNavigatePrev) {
        onNavigate(currentIndex - 1);
      } else if (direction === 'next' && canNavigateNext) {
        onNavigate(currentIndex + 1);
      }
    },
    [currentIndex, canNavigatePrev, canNavigateNext, onNavigate]
  );

  useEffect(() => {
    if (product) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;

      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      closeButtonRef.current?.focus();
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [product]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!product) return;

      if (event.key === 'Escape') {
        handleClose();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handleNavigate('prev');
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNavigate('next');
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [product, handleClose, handleNavigate]);

  if (!product && !isClosing) return null;

  const renderStars = (rating: number) => {
    return (
      <div className="modal-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? 'star filled' : 'star'}>
            ★
          </span>
        ))}
        <span className="rating-value">({rating})</span>
      </div>
    );
  };

  return (
    <div
      className={`modal-wrapper ${isClosing ? 'modal-closing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-backdrop" onClick={handleClose} />
      {items.length > 1 && (
        <Button
          variant="outline"
          size="md"
          iconOnly
          disabled={!canNavigatePrev}
          onClick={() => handleNavigate('prev')}
          aria-label="Previous product"
          title="Previous product (Arrow Left)"
          className="modal-nav-button modal-nav-button--prev"
        >
          <ChevronLeftIconComponent createElement={createElement as Pragma} />
        </Button>
      )}
      <div className="modal-content">
        <div className="modal-header">
          <h2 id="modal-title" className="modal-header-title">
            {product?.name}
          </h2>
          <Button
            ref={closeButtonRef}
            variant="ghost"
            size="md"
            iconOnly
            onClick={handleClose}
            aria-label="Close"
            className="modal-close"
          >
            <CloseIconComponent createElement={createElement as Pragma} />
          </Button>
        </div>
        <div className="modal-body ais-Scrollbar">
          <div className="modal-image">
            <img src={product?.image} alt={product?.name} />
          </div>
          <div className="modal-info">
            <div className="modal-meta">
              {product?.brand && (
                <span className="modal-brand">{product.brand}</span>
              )}
              {product?.free_shipping && (
                <span className="modal-badge">Free Shipping</span>
              )}
            </div>
            <h2>{product?.name}</h2>
            {Boolean(product?.rating) && renderStars(product?.rating)}
            {Boolean(product?.price) && (
              <div className="modal-price">${product?.price.toFixed(2)}</div>
            )}
            <p className="modal-description">{product?.description}</p>
            {product?.categories && product.categories.length > 0 && (
              <div className="modal-categories">
                {product.categories.map((category: string, index: number) => (
                  <span key={index} className="modal-category">
                    {category}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              window.location.href = `/products.html?pid=${product?.objectID}`;
            }}
            className="modal-action-button"
          >
            View Details
          </Button>
        </div>
      </div>
      {items.length > 1 && (
        <Button
          variant="outline"
          size="md"
          iconOnly
          disabled={!canNavigateNext}
          onClick={() => handleNavigate('next')}
          aria-label="Next product"
          title="Next product (Arrow Right)"
          className="modal-nav-button modal-nav-button--next"
        >
          <ChevronRightIconComponent createElement={createElement as Pragma} />
        </Button>
      )}
    </div>
  );
}

export function App() {
  const [selectedProduct, setSelectedProduct] =
    useState<SelectedProduct | null>(null);

  const handleProductClick = useCallback((product: Hit, items: Hit[]) => {
    const currentIndex = items.findIndex(
      (item) => item.objectID === product.objectID
    );
    setSelectedProduct({ product, items, currentIndex });
  }, []);

  const handleNavigate = useCallback(
    (newIndex: number) => {
      if (
        selectedProduct &&
        newIndex >= 0 &&
        newIndex < selectedProduct.items.length
      ) {
        setSelectedProduct({
          product: selectedProduct.items[newIndex],
          items: selectedProduct.items,
          currentIndex: newIndex,
        });
      }
    },
    [selectedProduct]
  );

  const ItemComponentWithModal = useMemo(
    () =>
      function ItemWithModal(props: { item: Hit }) {
        return <ItemComponent {...props} onProductClick={handleProductClick} />;
      },
    [handleProductClick]
  );

  const chatTools = useMemo(() => {
    const defaultTools = createDefaultTools(ItemComponentWithModal, undefined);

    const wrappedTools: UserClientSideTools = {};

    [SearchIndexToolType, RecommendToolType].forEach((toolKey) => {
      const tool = defaultTools[toolKey];
      const OriginalLayoutComponent = tool.layoutComponent;

      wrappedTools[toolKey] = {
        ...tool,
        layoutComponent: (props: ClientSideToolComponentProps) => {
          const items = (props.message?.output as { hits?: Hit[] })?.hits || [];

          return (
            <CarouselContext.Provider value={items}>
              <OriginalLayoutComponent {...props} />
            </CarouselContext.Provider>
          );
        },
      };
    });

    return wrappedTools;
  }, [ItemComponentWithModal]);

  return (
    <div>
      <header className="header">
        <h1 className="header-title">
          <a href="/">Getting started</a>
        </h1>
        <p className="header-subtitle">
          using{' '}
          <a href="https://github.com/algolia/instantsearch/tree/master/packages/react-instantsearch">
            React InstantSearch
          </a>
        </p>
      </header>

      <div className="container">
        <InstantSearch
          searchClient={searchClient}
          indexName="instant_search"
          insights={true}
        >
          <Configure hitsPerPage={8} />
          <div className="search-panel">
            <div className="search-panel__filters">
              <Panel header="brand">
                <RefinementList attribute="brand" />
              </Panel>
            </div>

            <div className="search-panel__results">
              <SearchBox placeholder="" className="searchbox" />
              <Hits hitComponent={HitComponent} />

              <div className="pagination">
                <Pagination />
              </div>
              <div>
                <TrendingItems
                  itemComponent={SimpleItemComponent}
                  limit={6}
                  layoutComponent={Carousel}
                />
              </div>
            </div>
          </div>

          <Chat
            agentId="7c2f6816-bfdb-46e9-a51f-9cb8e5fc9628"
            itemComponent={ItemComponentWithModal}
            tools={chatTools}
          />
        </InstantSearch>
      </div>

      <ProductModal
        selectedProduct={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

type HitType = Hit<{
  image: string;
  name: string;
  description: string;
}>;

function HitComponent({ hit }: { hit: HitType }) {
  return (
    <article>
      <h1>
        <a href={`/products.html?pid=${hit.objectID}`}>
          <Highlight attribute="name" hit={hit} />
        </a>
      </h1>
      <p>
        <Highlight attribute="description" hit={hit} />
      </p>
      <a href={`/products.html?pid=${hit.objectID}`}>See product</a>
    </article>
  );
}

function SimpleItemComponent({ item }: { item: Hit }) {
  return (
    <article className="ais-Carousel-hit">
      <div className="ais-Carousel-hit-image">
        <img src={item.image} />
      </div>
      <h2 className="ais-Carousel-hit-title">
        <a
          href={`/products.html?pid=${item.objectID}`}
          className="ais-Carousel-hit-link"
        >
          {item.name}
        </a>
      </h2>
    </article>
  );
}

function ItemComponent({
  item,
  onProductClick,
}: {
  item: Hit;
  onProductClick?: (product: Hit, items: Hit[]) => void;
}) {
  const items = useContext(CarouselContext);

  const handleFavorite = () => {
    // eslint-disable-next-line no-console
    console.log('Favorite');
  };

  const handleViewDetails = () => {
    onProductClick?.(item, items);
  };

  return (
    <article className="ais-Carousel-hit">
      <div className="ais-Carousel-hit-image">
        <img src={item.image} alt={item.name} />
      </div>
      <div className="ais-Carousel-hit-actions">
        <Button
          variant="outline"
          size="sm"
          iconOnly
          onClick={handleViewDetails}
          aria-label="View details"
          title="View details"
        >
          <Eye size={16} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          iconOnly
          onClick={handleFavorite}
          aria-label="Add to favorites"
          title="Add to favorites"
        >
          <Heart size={16} />
        </Button>
      </div>
      <h2 className="ais-Carousel-hit-title">
        <a
          href={`/products.html?pid=${item.objectID}`}
          className="ais-Carousel-hit-link"
        >
          {item.name}
        </a>
      </h2>
    </article>
  );
}
