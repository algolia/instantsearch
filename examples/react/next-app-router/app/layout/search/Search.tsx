'use client';

import React from 'react';
import { Hits } from 'react-instantsearch';

import { Hit } from '../../../components/Hit';
import { QueryId } from '../../../components/QueryId';

export default function Search() {
  return (
    <div className="Container">
      <div>
        <Hits hitComponent={Hit} />
      </div>
      <QueryId />
    </div>
  );
}
