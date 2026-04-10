import type { MDXComponents } from 'mdx/types';

import { SectionHeader } from './SectionHeader';
import { MetricGrid, Metric } from './Metric';
import { QuoteBlock } from './QuoteBlock';
import { BoxGrid, ProcessBox } from './ProcessBox';
import { TerminalCard } from './TerminalCard';
import { ProcessCard } from './ProcessCard';
import { ImageGrid } from './ImageGrid';
import { OutcomeBanner } from './OutcomeBanner';
import { SplitLayout, ContentLeft, ContentRight, ReadingFooter } from './LayoutBlocks';
import { FullwidthImage } from './FullwidthImage';
import { Tag, TagList, MetaRow } from './Primitives';
import { CompareBlock, CompareRow } from './CompareBlock';
import { CodeSnippet } from './CodeSnippet';

export const globalMdxComponents: MDXComponents = {
  SectionHeader,
  MetricGrid,
  Metric,
  QuoteBlock,
  BoxGrid,
  ProcessBox,
  TerminalCard,
  ProcessCard,
  ImageGrid,
  OutcomeBanner,
  SplitLayout,
  ContentLeft,
  ContentRight,
  ReadingFooter,
  FullwidthImage,
  Tag,
  TagList,
  MetaRow,
  CompareBlock,
  CompareRow,
  CodeSnippet,
};
