import { useState, useMemo } from 'react'
// import Table from './components/Table';
// import Toolbar from './components/Toolbar';
import {
  ColumnDef,
} from '@tanstack/react-table'
import CoinTable from './components/CoinTable';
import { roundBigUnit, roundDecimal } from './utils/utils';
const App: React.FC = () => {

  const [columns, setColumns] = useState<string[]>([
    "crypto_total_rank", 'base_currency', 'base_currency_desc', 'base_currency_logoid', "close", "24h_close_change|5", "market_cap_calc", "24h_vol_cmc", "circulating_supply"

  ]);

  const Coincolumns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'crypto_total_rank',
        header: () => 'Rank',
        cell: (info: any) => <div className='text-center'>{info.getValue()}</div>,
        id: 'rank',
        size: 40,
        // disable sorting for this column
      },
      {
        accessorKey: 'base_currency',
        header: () => 'coin',
        cell: (info: any) => <div className="flex items-center">
          <img src={`https://s3-symbol-logo.tradingview.com/${info.row.original.base_currency_logoid}.svg`} alt="Coin" className="w-8 h-8 mr-2" />
          <span className='text-black'>{info.row.original.base_currency} ({info.row.original.base_currency_desc})</span>
        </div>,
        id: 'Coin',
        size: 200,
      },


      {
        accessorKey: 'close',
        header: () => <span >Price</span>,
        cell: (info: any) => <span>${roundDecimal(info.getValue(),7)}</span>,
        id: 'price',
        size: 50,
        // disable sorting for this column
      },
      {
        accessorKey: '24h_close_change|5',
        header: 'Change & 24h',
        id: 'change',
        cell: (info: any) => {

          const isIncrease = info.getValue() > 0;
          const isDecrease = info.getValue() < 0;

          return (
            <div
              className={`px-4 py-2 ${isIncrease ? "text-green-500 animate-fade" : ""} ${isDecrease ? "text-red-500 animate-fade" : ""}`}
              onAnimationEnd={(e) => {    // Remove the class after the animation ends
                e.currentTarget.classList.remove("text-green-500", "text-red-500");
              }}
            >
              {(info.getValue()).toFixed(2)}%
            </div >
          )

        },
        size: 100,
      },
      {
        accessorKey: 'market_cap_calc',
        header: 'Market Cap',
        id: 'market',
        cell: (info: any) => <span className='text-black'>${roundBigUnit(info.getValue())}</span>,
        size: 180,
      },
      {
        accessorKey: '24h_vol_cmc',
        header: 'Volume 24h',
        id: 'volume',
        cell: (info: any) => <span className='text-black'>${roundBigUnit(info.getValue())}</span>,
        size: 180,
      },
      {
        accessorKey: 'circulating_supply',
        header: 'Circ Supply',
        id: 'supply',
        cell: (info: any) => <span className='text-black'>{roundBigUnit((info.getValue()))}</span>,
        size: 180,
      },
    ],
    []
  )
  //@ts-ignore
  const updateData = (newColumns: string[]) => {
    setColumns(newColumns);
  };
  return (
    <div className="container mx-auto ">
      {/* <Toolbar updateData={updateData} />
      <Table columns={columns} /> */}
      <CoinTable columns={Coincolumns} body={columns} />
    </div>
  );
};

export default App;
