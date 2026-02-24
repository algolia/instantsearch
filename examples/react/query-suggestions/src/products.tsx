import React from 'react';
import { createRoot } from 'react-dom/client';

import { Product } from './Product';

const searchParams = new URLSearchParams(document.location.search);

const pid = searchParams.get('pid');

createRoot(document.getElementById('root')!).render(<Product pid={pid!} />);
