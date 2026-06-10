import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MobileVerseGuide } from './MobileVerseGuide';

describe('MobileVerseGuide', () => {
    // 장, 절 정보와 한글 텍스트가 정상 렌더링되는지 검증함
    it('장, 절 정보와 한글 번역 텍스트를 정상적으로 렌더링함', () => {
        render(
            <MobileVerseGuide
                chapterNum="1"
                verseNum="1"
                koreanText="자, 이제 요가에 대한 설명이다."
            />
        );

        // 장/절 텍스트 확인
        expect(screen.getByText('1장 / 1절')).toBeInTheDocument();

        // 한국어 텍스트 확인
        expect(screen.getByText('자, 이제 요가에 대한 설명이다.')).toBeInTheDocument();
    });
});
