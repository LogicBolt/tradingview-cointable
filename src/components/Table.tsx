import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useTable, useSortBy } from 'react-table';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/20/solid'; // Ensure correct import for v2
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { roundBigUnit, roundDecimal } from '../utils/utils';
type CryptoData = {
    [key: string]: any;
};

const Table: React.FC<{ columns: string[] }> = ({ columns }) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [prevData, setPrevData] = useState<any[]>([]);
    const [dynamicColumns, setDynamicColumns] = useState<string[]>(columns);

    const fetchData = useCallback(async () => {
        // setLoading(true);
        try {
            const response = await axios.post('https://sleet-bouncy-seaplane.glitch.me/proxy', {
                columns,
                ignore_unknown_fields: false,
                options: { lang: 'en' },
                range: [0, 5],
                sort: { sortBy: 'crypto_total_rank', sortOrder: 'asc' },
                symbols: {},
                markets: ['coin']
            });
            // Transform response.data.data into an array of objects based on columns
            const transformedData = response.data.data.map((item: any) => {
                const row: CryptoData = {
                    COIN: `${item.d[0]} (${item.d[1]})`,
                    COIN_IMG: item.d[2],
                };
                columns.slice(3).forEach((column, index) => {
                    row[column] = item.d[index + 3];
                });
                return row;
            });

            setData(transformedData);
            setLoading(false)
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [columns]);

    useEffect(() => {
        fetchData(); // Fetch data initially

        const intervalId = setInterval(() => {
            fetchData(); // Fetch data every 10 seconds
        }, 10000); // 10000 ms = 10 seconds

        setPrevData(data); // Set previous data before updating the state
        return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }, [fetchData]);
    console.log(prevData)

    const headers = useMemo(() => {
        return [
            {
                Header: 'COIN',
                accessor: 'COIN',
                Cell: ({ row }: any) => (
                    <div className="flex items-center">
                        <img src={`https://s3-symbol-logo.tradingview.com/${row.original.COIN_IMG}.svg`} alt="Coin" className="w-8 h-8 mr-2" />
                        <span className='text-black'>{row.values.COIN}</span>
                    </div>
                ),
            },
            ...dynamicColumns.slice(3).map((column, index) => {
                let headerName = column.replace(/_/g, ' ').toUpperCase();
                let formatValue = (value: any) => value; // Default formatting

                switch (column) {
                    case 'crypto_total_rank':
                        headerName = 'Rank';
                        formatValue = (value: any) => `${value}`;
                        break;
                    case 'close':
                        headerName = 'Price';
                        formatValue = (value: any) => `$${roundDecimal(value)}`;
                        break;
                    case '24h_close_change|5':
                        headerName = 'Change & 24h';
                        formatValue = (value: any) => `${value.toFixed(2)}%`;
                        break;
                    case 'market_cap_calc':
                        headerName = 'Market Cap';
                        formatValue = (value: any) => `${roundBigUnit(value)} USD`;
                        break;
                    case '24h_vol_cmc':
                        headerName = 'Volume 24h';
                        formatValue = (value: any) => `${roundBigUnit(value)} USD`;
                        break;
                    case 'circulating_supply':
                        headerName = 'Circ Supply';
                        formatValue = (value: any) => `$${roundBigUnit(value)}`;
                        break;
                    default:
                        break;
                }

                return {
                    Header: headerName,
                    accessor: column,
                    id: `${column}_${index}`, // Ensure the ID is unique
                    Cell: column === 'close'
                        ? ({ value, row }: any) => {
                            // Determine if the value increased or decreased

                            const prevValue = prevData[row.index]?.[column];
                            // console.log(prevValue, typeof prevValue, value, typeof value)
                            const isIncrease = prevValue !== undefined && value > prevValue;
                            const isDecrease = prevValue !== undefined && value < prevValue;
                            // console.log(isIncrease, isDecrease)
                            return (
                                <div
                                    className={`px-4 py-2 ${isIncrease ? "text-green-500 animate-fade" : ""} ${isDecrease ? "text-red-500 animate-fade" : ""}`}
                                    onAnimationEnd={(e) => {    // Remove the class after the animation ends
                                        e.currentTarget.classList.remove("text-green-500", "text-red-500");
                                    }}
                                >
                                    {formatValue(value)}
                                </div >
                            );
                        }
                        : column === '24h_close_change|5' ?
                            ({ value }: any) => {
                                // Determine if the value increased or decreased


                                const isIncrease = value > 0;
                                const isDecrease = value < 0;
                                // console.log(isIncrease, isDecrease)
                                return (
                                    <div
                                        className={`px-4 py-2 ${isIncrease ? "text-green-500 animate-fade" : ""} ${isDecrease ? "text-red-500 animate-fade" : ""}`}
                                        onAnimationEnd={(e) => {    // Remove the class after the animation ends
                                            e.currentTarget.classList.remove("text-green-500", "text-red-500");
                                        }}
                                    >
                                        {formatValue(value)}
                                    </div >
                                );
                            }
                            : ({ value }: any) => <div className='text-black'>{formatValue(value)}</div>
                };
            })
        ]

    }, [dynamicColumns, data]);
    let {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns: headers, data }, useSortBy);

    let onDragEnd = (result: any) => {
        if (!result.destination) return;
        const reorderedColumns = Array.from(dynamicColumns);
        const [removed] = reorderedColumns.splice(result.source.index, 1);
        reorderedColumns.splice(result.destination.index, 0, removed);
        // Set reordered rows to state or handle as needed
        setDynamicColumns(reorderedColumns);
    };
    console.log(headerGroups)
    return (
        <div className="table-container">
            {loading ? (
                <p>Loading...</p>
            ) : (

                <table {...getTableProps()} className="min-w-full bg-white text-center" >
                    <thead >
                        {
                            // <tr {...headerGroup.getHeaderGroupProps()}>
                            //     {headerGroup.headers.map(column => (
                            //         <th
                            //             //@ts-ignore
                            //             {...column.getHeaderProps(column.getSortByToggleProps())}
                            //             className="px-4 py-2 border-b hover:bg-gray-100 cursor-pointer "
                            //         >
                            //             {column.render('Header')}
                            //             <span className="inline-flex ml-2">

                            //                 {
                            //                     //@ts-ignore
                            //                     column.isSorted
                            //                         //@ts-ignore
                            //                         ? column.isSortedDesc
                            //                             ? <ChevronDownIcon className="h-5 w-5" />
                            //                             : <ChevronUpIcon className="h-5 w-5" />
                            //                         : null}
                            //             </span>
                            //         </th>
                            //     ))}
                            // </tr>
                            <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId="table-headers" direction="horizontal">
                                    {(provided) => (
                                        <tr {...provided.droppableProps} ref={provided.innerRef}>
                                            {headerGroups[0].headers.map((column, index) => (
                                                <Draggable key={column.id} draggableId={column.id} index={index}>
                                                    {(provided) => (
                                                        <th
                                                            //@ts-ignore
                                                            {...column.getHeaderProps(column.getSortByToggleProps())}
                                                            className="px-4 py-2 border-b hover:bg-gray-100 cursor-pointer"
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                        >
                                                            {column.render('Header')}
                                                            <span className="inline-flex ml-2">

                                                                {
                                                                    //@ts-ignore
                                                                    column.isSorted ? column.isSortedDesc
                                                                        ? <ChevronDownIcon className="h-5 w-5" />
                                                                        : <ChevronUpIcon className="h-5 w-5" />
                                                                        : null}
                                                            </span>
                                                        </th>
                                                    )}
                                                </Draggable>
                                            ))}

                                            {provided.placeholder}
                                        </tr>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        }
                    </thead>

                    <tbody {...getTableBodyProps()}>
                        {rows.map((row) => {
                            prepareRow(row);
                            return (
                                <tr {...row.getRowProps()} className="hover:bg-gray-100">
                                    {row.cells.map(cell => (
                                        <td {...cell.getCellProps()} className="px-4 py-2 border-b">
                                            {cell.render('Cell')}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
                   
        
        </div>
    );
};

export default Table;
