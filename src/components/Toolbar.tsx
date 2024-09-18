import React from 'react';

interface ToolbarProps {
  updateData: (columns: string[]) => void;
}
//@ts-ignore
const Toolbar: React.FC<ToolbarProps> = ({ updateData }) => {
//   const columns1 = [
//    'base_currency', 'base_currency_desc', 'base_currency_logoid', "close", "crypto_total_rank", "24h_close_change|5", "market_cap_calc", "24h_vol_cmc", "circulating_supply"
    
//   ];

//   const columns2 = [
//     'close', 'pricescale', 'minmov', 'fractional', 'minmove2', 
//     'currency', '24h_close_change|5', 'market_cap_calc'
//   ];

//   const columns3 = [
//     'fundamental_currency_code', '24h_vol_cmc', 'circulating_supply', 
//     'crypto_common_categories.tr'
//   ];

  return (
    <div className="toolbar-container flex justify-between p-4 bg-gray-100">
      {/* <button
        onClick={() => updateData(columns1)}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Columns Set 1
      </button>
      <button
        onClick={() => updateData(columns2)}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Columns Set 2
      </button>
      <button
        onClick={() => updateData(columns3)}
        className="bg-purple-500 text-white px-4 py-2 rounded"
      >
        Columns Set 3
      </button> */}
    </div>
  );
};

export default Toolbar;
