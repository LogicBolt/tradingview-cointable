import React, { useState, useEffect, useCallback, useMemo, CSSProperties, useRef } from 'react';
import axios from 'axios';

import {
    Cell,

    Header,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel
} from '@tanstack/react-table'
import {
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    closestCenter,
    type DragEndEvent,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'
import {
    arrayMove,
    SortableContext,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
// needed for row & cell level scope DnD setup
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TradingViewWidget from './TradingViewWidget';
type CryptoData = {
    [key: string]: any;
};

const CoinTable: React.FC<{ columns: any[], body: String[] }> = ({ columns, body }) => {
    const [data, setData] = useState<any[]>([]);

    const [prevData, setPrevData] = useState<any[]>([]);
    const [sorting, setSorting] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const dataRef = useRef<any[]>(data);
    const [view, setView] = useState<'table' | 'chart'>('table');

    const fetchData = useCallback(async () => {

        try {

            const response = await axios.post('https://sleet-bouncy-seaplane.glitch.me/proxy', {
                columns: body,
                ignore_unknown_fields: false,
                options: { lang: 'en' },
                range: [0, 50],
                sort: { sortBy: 'crypto_total_rank', sortOrder: 'asc' },
                symbols: {},
                markets: ['coin']
            });
            // Transform response.data.data into an array of objects based on columns
            const transformedData = response.data.data.map((item: any) => {
                let row: CryptoData = {
                };
                body.forEach((column, index) => {
                    //@ts-ignore
                    row[column] = item.d[index];
                });
                return row;
            });
            //  // Set previous data before updating the state
            setPrevData(dataRef.current); // Store the current data as previous data before updating
            setData(transformedData);
            dataRef.current = transformedData; // Update the ref with the new data


        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {

        }
    }, [columns, body]);

    useEffect(() => {
        fetchData(); // Fetch data initially

        const intervalId = setInterval(() => {

            fetchData(); // Fetch data every 10 seconds
        }, 10000); // 10000 ms = 10 seconds

        // setPrevData(data); // Set previous data before updating the state
        return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }, [fetchData]);

    const filteredData = useMemo(() => {
        if (searchTerm) {
            return data.filter((row) =>
                row['base_currency_desc'].toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return data;
    }, [searchTerm, data]);

    const [columnOrder, setColumnOrder] = React.useState<string[]>(() =>
        columns.map(c => c.id!)
    )
    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(), //client-side sorting
        state: {
            columnOrder,
            sorting
        },
        onSortingChange: setSorting,
        onColumnOrderChange: setColumnOrder,
        debugTable: true,
        debugHeaders: true,
        debugColumns: true,
    })
    // reorder columns after drag & drop
    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        if (active && over && active.id !== over.id) {
            setColumnOrder(columnOrder => {
                const oldIndex = columnOrder.indexOf(active.id as string)
                const newIndex = columnOrder.indexOf(over.id as string)
                return arrayMove(columnOrder, oldIndex, newIndex) //this is just a splice util
            })
        }
    }

    const sensors = useSensors(
        useSensor(MouseSensor, {}),
        useSensor(TouchSensor, {}),
        useSensor(KeyboardSensor, {})
    )
    console.log(data)
    return (
        <div className="table-container w-full overflow-x-auto ">
            <div className="table-container w-full overflow-x-auto">
                <div className="flex justify-end p-4">
                    <input type='text' value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder='search coin' className='border ml-40 mr-4 p-1' />
                    <button
                        onClick={() => setView('table')}
                        className={`px-4 py-2 mr-2 ${view === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        Table View
                    </button>
                    <button
                        onClick={() => setView('chart')}
                        className={`px-4 py-2 ${view === 'chart' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        Chart View
                    </button>
                </div>
            </div>
            {view === 'table' ? (
                data.length <= 0 ? (
                    <p className="text-center text-gray-600">Loading...</p>
                ) : (
                    <DndContext
                        collisionDetection={closestCenter}
                        modifiers={[restrictToHorizontalAxis]}
                        onDragEnd={handleDragEnd}
                        sensors={sensors}
                    >
                        <div className="p-4 bg-white shadow-md rounded-md">
                            <table className="min-w-full table-auto">
                                <thead className="bg-gray-100">
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <tr key={headerGroup.id}>
                                            <SortableContext
                                                items={columnOrder}
                                                strategy={horizontalListSortingStrategy}
                                            >
                                                {headerGroup.headers.map(header => (
                                                    <th key={header.id} className="px-4 text-left text-sm font-medium text-gray-900 hover:bg-gray-200 cursor-pointer">
                                                        <DraggableTableHeader key={header.id} header={header} term={searchTerm} setTerm={setSearchTerm} />
                                                    </th>
                                                ))}
                                            </SortableContext>
                                        </tr>
                                    ))}
                                </thead>
                                <tbody>
                                    {table.getRowModel().rows.map(row => (
                                        <tr key={row.id}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                                            onClick={() => window.open(`https://coinmarketcap.com/currencies/${row.original.base_currency_desc}/`, '_blank')}
                                            className="cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                                        >
                                            {row.getVisibleCells().map(cell => (
                                                <SortableContext
                                                    key={cell.id}
                                                    items={columnOrder}
                                                    strategy={horizontalListSortingStrategy}
                                                >
                                                    <DragAlongCell key={cell.id} cell={cell} prevData={prevData} />
                                                </SortableContext>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </DndContext>
                )
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    {data.map((row, index) => (
                        index < 15 && <div key={index} className="bg-white p-4 shadow-md rounded-md">
                            <TradingViewWidget symbol={`CRYPTO:${row.base_currency}USD`} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CoinTable;


const DraggableTableHeader = ({
    header,
    //@ts-ignore
    term,
    //@ts-ignore
    setTerm
}: {
    header: Header<any, unknown>,
    term: any,
    setTerm: any
}) => {
    const { attributes, isDragging, listeners, setNodeRef, transform, } =
        useSortable({
            id: header.column.id,
        })

    const style: CSSProperties = {
        opacity: isDragging ? 0.8 : 1,
        position: 'relative',
        transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
        transition: 'width transform 0.2s ease-in-out',
        whiteSpace: 'nowrap',
        width: header.column.getSize(),
        zIndex: isDragging ? 1 : 0,
    }
    return (
        <th colSpan={header.colSpan} ref={setNodeRef} style={style} className="" key={header.id}>
            {header.isPlaceholder ? null : (
                <div
                    {...{
                        className: header.column.getCanSort()
                            ? "cursor-pointer select-none"
                            : "",
                        onClick: header.column.getToggleSortingHandler(),
                    }}
                >
                    {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                    )}
                    {{
                        asc: (
                            ' 🔼'
                        ),
                        desc: (
                            ' 🔽'
                        ),
                    }[header.column.getIsSorted() as string] ?? (
                            <i className="fa-solid fa-circle-chevron-up opacity-100 ps-10"></i>
                        )}
                    <div {...attributes} {...listeners} >
                        {"<-->"}
                    </div>

                </div>
            )}
        </th>
    )
}

const DragAlongCell = ({ cell, prevData }: { cell: Cell<any, unknown>, prevData: any[] }) => {
    const { isDragging, setNodeRef, transform } = useSortable({
        id: cell.column.id,
    })

    const style: CSSProperties = {
        opacity: isDragging ? 0.8 : 1,
        position: 'relative',
        transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
        transition: 'width transform 0.2s ease-in-out',
        width: cell.column.getSize(),
        zIndex: isDragging ? 1 : 0,
        textAlign: 'right',
        color: getColor(cell, prevData)
    }

    return (
        <td style={style} ref={setNodeRef}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
    )
}

const getColor = (cell: Cell<any, unknown>, prevData: any[]) => {
    if (cell.column.id === 'price') {

        const prevValue = prevData?.find(row => row.crypto_total_rank === cell.row.original.crypto_total_rank)?.["close"];
        const currentValue = cell.getValue();
        //@ts-ignore
        if (currentValue > prevValue) {
            return 'green';
            //@ts-ignore
        } else if (currentValue < prevValue) {
            return 'red';
        }
    }

    return 'black';
}