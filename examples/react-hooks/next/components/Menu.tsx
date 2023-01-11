import Link from 'next/link';
import router from 'next/router';

export default function Menu() {
  return (
    <div>
      Menu:
      <ul style={{ display: 'flex', gap: '1em', listStyle: 'none' }}>
        <li>
          <Link href={`/search/`}>Home</Link>
        </li>
        <li>
          <Link href={`/search/appliances`}>Appliances</Link>
        </li>
        <li>
          <button
            onClick={() =>
              router.push('/search/audio', undefined, { shallow: true })
            }
          >
            audio
          </button>
        </li>
        <li>
          <Link href={`/search/cell%20phones`}>Cell Phones</Link>
        </li>
        <li>
          <Link href={`/search/housewares`}>Housewares</Link>
        </li>
        <li>
          <Link href={`/search/musical%20instruments`}>
            Musical Instruments
          </Link>{' '}
        </li>
      </ul>
    </div>
  );
}
