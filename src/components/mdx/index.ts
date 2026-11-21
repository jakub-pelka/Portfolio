import type { MDXComponents } from 'mdx/types';

import { SectionHeader } from './SectionHeader';
import { QuoteBlock } from './QuoteBlock';
import { BoxGrid, ProcessBox } from './ProcessBox';
import { TerminalCard } from './TerminalCard';
import { ProcessCard } from './ProcessCard';
import { OutcomeBanner } from './OutcomeBanner';
import { SplitLayout, ContentLeft, ContentRight } from './LayoutBlocks';
import { FullwidthImage } from './FullwidthImage';
import { Tag, TagList, MetaRow } from './Primitives';
import { CompareBlock, CompareRow } from './CompareBlock';

export const globalMdxComponents: MDXComponents = {
  SectionHeader,
  QuoteBlock,
  BoxGrid,
  ProcessBox,
  TerminalCard,
  ProcessCard,
  OutcomeBanner,
  SplitLayout,
  ContentLeft,
  ContentRight,
  FullwidthImage,
  Tag,
  TagList,
  MetaRow,
  CompareBlock,
  CompareRow,
};
