import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ApolloProvider, split, HttpLink, ApolloClient, InMemoryCache } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import {WebSocketLink} from '@apollo/client/link/ws';

const wsLink = new WebSocketLink({
    uri: 'wss://ws-thegraph.bellecour.iex.ec/subgraphs/name/bellecour/poco-v5',
    options: {
        reconnect: true
    }
});

const httpLink = new HttpLink({
    uri: 'https://thegraph.bellecour.iex.ec/subgraphs/name/bellecour/poco-v5'
});

const splitLink = split(
    ({ query }) => {
        const definition = getMainDefinition(query);
        return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
        );
    },
    wsLink,
    httpLink,
);

const client = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache()
});


const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <>
    <ApolloProvider client={client}>
        <App />
    </ApolloProvider>
    </>
);
