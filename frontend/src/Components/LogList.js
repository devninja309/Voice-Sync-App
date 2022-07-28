//List of courses in DB
import { ButtonGroup } from '@blueprintjs/core';
import React from 'react';

import { useState, useEffect } from 'react';
import { IconButton } from '../Elements/IconButton';
import { SimpleButton } from '../Elements/SimpleButton';

import { useAuthTools } from '../Hooks/Auth';

export default function LogList(props) {


    const [logs, setLogs] = useState('');
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(0);
    const [records, setRecords] = useState(0);
    const [pageCount, setPageCount] = useState(0);
    const { token, APICalls } = useAuthTools();

    useEffect(() => {
        APICalls.GetEventLogSize()
            .then(
                data => {
                    setRecords(data.Records);
                    setLimit(data.Limit);
                    if (data.Limit > 0) {
                        setPageCount(Math.ceil(records/limit));
                    }
                }
            )
    })

    useEffect(() => {
        if (!token) {
            return;
        }
        APICalls.GetEventLogs(page)
            .then(
                data => {
                    if (data == '') {
                        return;
                    }
                    try {
                        setLogs(data.sort(function (a, b) {
                            return new Date(b.TimeStamp) - new Date(a.TimeStamp);
                        }));
                    }
                    catch (err) {
                        alert('Bad Log values');
                        return;
                    }
                })

    }, [page, token]); //TODO I SAY that I want fetchWithAuth here, but when I get it, I just update and update and update because apparently fetchWithAuth changes with every call
    function DisplayLogsList() {
        if (logs) {
            return logs.map(log => (<tr className="LogListTable-DataRow"><td>{new Date(log.TimeStamp).toLocaleString()}</td><td>{log.User}</td><td>{log.Message}</td></tr>))
        }
        else {
        }
    }

    function paginationControls() {
        if (!limit || !records || pageCount <= 0 || pageCount >= 10000) {
            return (<p>No Data</p>);
        }
        const array = Array.from({ length: pageCount }, (_, index) => index + 1);
        if (pageCount <= 5) {
            return array.map(pageVar => (
                <SimpleButton onClick={() => setPage(pageVar - 1)} text={pageVar} disabled={(pageVar - 1) === page} minimal={true} />
            )
            )
        } else if (pageCount >= 6) {
            let pages = [];

            if (page <= 2) {
                // if on first or second page
                pages.push(2, 3, 4);
            } else if (page === array[array.length - 3]) {
                // if on second to last page
                pages.push(array[page - 2], array[page - 1], array[page]);
            } else if (page === array[array.length - 2]) {
                // if on last page
                pages.push(array[page - 3], array[page - 2], array[page - 1]);
            } else if (page >= 3) {
                // if on middle pages
                pages.push(array[page - 1], array[page], array[page + 1])
            }

            // add first and last pages
            pages.unshift(array[0]);
            pages.push(array[array.length - 1]);

            return pages.map(pageVar => (
                <SimpleButton onClick={() => setPage(pageVar - 1)} text={pageVar} disabled={(pageVar - 1) === page} minimal={true} />
            )
            )
        }
    }

    const messageStyle = {
        width: '75%'
    };
    const dateStyle = {
        width: '15%'
    };

    return (
        <div className="logListBox">
            <table className="LogListTable">
                <thead>
                    <tr className="LogListTable-HeaderRow">
                        <th style={dateStyle}>Date</th>
                        <th>User</th>
                        <th style={messageStyle}>Message</th>
                    </tr>
                </thead>
                <tbody>
                    {DisplayLogsList()}
                </tbody>
            </table>
            <div>
                <ButtonGroup>
                    <IconButton icon="caret-left" onClick={() => setPage(page - 1)} disabled={page <= 0} />
                    {paginationControls()}
                    <IconButton icon="caret-right" onClick={() => setPage(page + 1)} disabled={page >= pageCount - 1} />
                </ButtonGroup>
            </div>
        </div>
    )
}
