import React from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { Chip } from './ui/Primitives';
import { IconCheck } from './ui/Icon';

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const PlanRow = styled.button`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: ${p => (p.$selected ? theme.colors.primaryLight : theme.colors.surfaceMuted)};
  border: 1.5px solid ${p => (p.$selected ? theme.colors.primary : 'transparent')};
  border-radius: ${theme.radius.sm};
  padding: 14px;
  cursor: pointer;
  text-align: left;
  transition: ${theme.transitions.fast};
`;

const RadioDot = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${p => (p.$selected ? theme.colors.primary : theme.colors.surface)};
  border: 1.5px solid ${p => (p.$selected ? theme.colors.primary : theme.colors.borderStrong)};
  color: #fff;
`;

const Body = styled.div`flex: 1; min-width: 0;`;

const TopLine = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
`;

const PlanName = styled.p`
  font-size: 14.5px;
  font-weight: 700;
  color: ${theme.colors.text};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const PlanPrice = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${p => (p.$free ? theme.colors.textSecondary : theme.colors.primaryDark)};
`;

const CoverageList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const CoverageItem = styled.li`
  font-size: 12px;
  color: ${theme.colors.textSecondary};
  padding: 1px 0;
  line-height: 1.5;

  &::before { content: '· '; }
`;

const PLANS = [
  {
    key: 'none',
    name: '보험 없음',
    price: 0,
    priceLabel: '무료',
    coverage: ['보험 미적용', '사고 시 전액 자기 부담'],
    dao: false,
  },
  {
    key: 'basic',
    name: '기본 보험',
    price: 10000,
    priceLabel: '10,000 W-KRW',
    coverage: ['대인 최대 1억원 보장', '대물 최대 2,000만원', '자차손해 미포함'],
    dao: true,
  },
  {
    key: 'premium',
    name: '프리미엄',
    price: 25000,
    priceLabel: '25,000 W-KRW',
    coverage: ['대인 무제한 보장', '대물 최대 5,000만원', '자차손해 포함', '긴급출동 서비스'],
    dao: true,
  },
];

export default function InsuranceSelect({ selected, onChange }) {
  return (
    <List>
      {PLANS.map(plan => {
        const isSelected = selected === plan.key;
        return (
          <PlanRow key={plan.key} $selected={isSelected} onClick={() => onChange(plan)}>
            <RadioDot $selected={isSelected}>{isSelected && <IconCheck size={12} />}</RadioDot>
            <Body>
              <TopLine>
                <PlanName>{plan.name}</PlanName>
                <PlanPrice $free={plan.price === 0}>{plan.priceLabel}</PlanPrice>
              </TopLine>
              <CoverageList>
                {plan.coverage.map(c => <CoverageItem key={c}>{c}</CoverageItem>)}
              </CoverageList>
              {plan.dao && <Chip $tone="primary" style={{ marginTop: 8 }}>DAO 상호공제</Chip>}
            </Body>
          </PlanRow>
        );
      })}
    </List>
  );
}

export { PLANS };
