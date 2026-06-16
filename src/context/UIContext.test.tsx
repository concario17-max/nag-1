import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { UIProvider, useUI } from './UIContext';

// UIContext 기능을 검증하는 테스트 컴포넌트임
const TestComponent = () => {
    const { activeVerseContentMode, setActiveVerseContentMode } = useUI();
    return (
        <div>
            <span data-testid="mode">{activeVerseContentMode}</span>
            <button data-testid="change-btn" onClick={() => setActiveVerseContentMode('body')}>
                Change Mode
            </button>
        </div>
    );
};

describe('UIContext', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('localStorage에 값이 있더라도 초기 activeVerseContentMode는 무조건 commentary여야 함', () => {
        // 이미 localStorage에 'body'가 들어있다고 가정함
        localStorage.setItem('yoga-verse-content-mode', 'body');

        render(
            <UIProvider>
                <TestComponent />
            </UIProvider>
        );

        // 첫 진입 시 무조건 commentary여야 함
        expect(screen.getByTestId('mode').textContent).toBe('commentary');
    });

    it('activeVerseContentMode 변경 시 상태가 정상적으로 업데이트되어야 함', () => {
        render(
            <UIProvider>
                <TestComponent />
            </UIProvider>
        );

        expect(screen.getByTestId('mode').textContent).toBe('commentary');

        const btn = screen.getByTestId('change-btn');
        act(() => {
            btn.click();
        });

        expect(screen.getByTestId('mode').textContent).toBe('body');
    });
});
