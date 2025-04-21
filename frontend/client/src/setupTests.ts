/// <reference types="@testing-library/jest-dom" />

import '@testing-library/jest-dom';

declare global {
    var Html5QrcodeScanner: any;
    namespace jest {
        interface Matchers<R> {
            toBeInTheDocument(): R;
        }
    }
}

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock ResizeObserver
window.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// Mock IndexedDB
const indexedDB = {
    open: jest.fn(),
    deleteDatabase: jest.fn(),
};

Object.defineProperty(window, 'indexedDB', {
    writable: true,
    value: indexedDB,
});

// Mock HTML5 QR Scanner element
class MockHtml5QrcodeScanner {
    render(): void { }
    clear(): void { }
}

global.Html5QrcodeScanner = MockHtml5QrcodeScanner;

interface PermissionStatus {
    state: 'granted' | 'denied' | 'prompt';
}

// Mock permissions API
Object.defineProperty(navigator, 'permissions', {
    value: {
        query: jest.fn().mockImplementation((): Promise<PermissionStatus> =>
            Promise.resolve({ state: 'granted' })
        ),
    },
});

interface GeolocationPosition {
    coords: {
        latitude: number;
        longitude: number;
        accuracy: number;
    };
}

type PositionCallback = (position: GeolocationPosition) => void;

// Mock geolocation API
const mockGeolocation = {
    getCurrentPosition: jest.fn().mockImplementation((success: PositionCallback) =>
        success({
            coords: {
                latitude: 0,
                longitude: 0,
                accuracy: 0,
            },
        })
    ),
};

Object.defineProperty(navigator, 'geolocation', {
    value: mockGeolocation,
});

export { };
