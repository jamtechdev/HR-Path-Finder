import * as d3 from 'd3';
import { Network, X } from 'lucide-react';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { treeStructure } from '@/config/treeStructure';
import { useIsMobile } from '@/hooks/use-mobile';

interface HrSystemSnapshot {
    company: {
        name: string;
        industry: string;
        size: number;
    };
    ceo_philosophy: {
        main_trait?: string;
        secondary_trait?: string;
    };
    job_architecture: {
        jobs_defined: number;
        structure_type?: string;
        job_grade_structure?: string;
    };
    performance_management: {
        model?: string;
        method?: string;
        cycle?: string;
        rating_scale?: string;
        evaluation_logic?: string;
    };
    compensation_benefits: {
        salary_system?: string;
        salary_structure_type?: string;
        salary_increase_process?: string;
        bonus_metric?: string;
        benefits_level?: number;
        welfare_program?: string;
        benefits_strategic_direction?: string | string[];
    };
    diagnosis?: {
        industry_category?: string;
        industry_subcategory?: string;
        present_headcount?: number;
        expected_headcount_1y?: number;
        average_age?: number;
        gender_ratio?: number;
        total_executives?: number;
        leadership_percentage?: number;
    };
    hr_system_report: {
        status: string;
    };
}

interface TreeNode {
    id: string;
    name: string;
    type: 'step' | 'tab';
    parent?: string;
    data?: any;
    children?: TreeNode[];
    expanded?: boolean;
}

interface D3TreeViewProps {
    hrSystemSnapshot: HrSystemSnapshot;
}

interface ResponsiveConfig {
    margin: { top: number; right: number; bottom: number; left: number };
    nodeWidth: { step: number; tab: number };
    nodeHeight: { step: number; tab: number };
    fontSize: { title: { step: string; tab: string }; data: string };
    spacing: { vertical: number; horizontal: number; child: number };
    expandButton: { size: number; offset: number };
    maxDataEntries: number;
    textLength: { label: number; value: number };
}

export default function D3TreeView({ hrSystemSnapshot }: D3TreeViewProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const isMobile = useIsMobile();
    const resizeObserverRef = useRef<ResizeObserver | null>(null);

    // Get responsive configuration based on screen size
    const getResponsiveConfig = useCallback((width: number, height: number): ResponsiveConfig => {
        const isSmallMobile = width < 480;
        const isMobileDevice = width < 768;
        const isTablet = width >= 768 && width < 1024;
        const isDesktop = width >= 1024 && width < 1440;
        const isLargeDesktop = width >= 1440;

        if (isSmallMobile) {
            return {
                margin: { top: 30, right: 15, bottom: 30, left: 30 },
                nodeWidth: { step: 160, tab: 140 },
                nodeHeight: { step: 65, tab: 55 },
                fontSize: { title: { step: '11px', tab: '10px' }, data: '8px' },
                spacing: { vertical: 70, horizontal: 120, child: 60 },
                expandButton: { size: 10, offset: 15 },
                maxDataEntries: 1,
                textLength: { label: 10, value: 12 },
            };
        } else if (isMobileDevice) {
            return {
                margin: { top: 40, right: 20, bottom: 40, left: 40 },
                nodeWidth: { step: 180, tab: 160 },
                nodeHeight: { step: 75, tab: 65 },
                fontSize: { title: { step: '12px', tab: '11px' }, data: '9px' },
                spacing: { vertical: 80, horizontal: 140, child: 70 },
                expandButton: { size: 11, offset: 18 },
                maxDataEntries: 1,
                textLength: { label: 12, value: 15 },
            };
        } else if (isTablet) {
            return {
                margin: { top: 50, right: 30, bottom: 50, left: 60 },
                nodeWidth: { step: 220, tab: 200 },
                nodeHeight: { step: 90, tab: 75 },
                fontSize: { title: { step: '14px', tab: '12px' }, data: '10px' },
                spacing: { vertical: 100, horizontal: 180, child: 80 },
                expandButton: { size: 12, offset: 20 },
                maxDataEntries: 2,
                textLength: { label: 14, value: 18 },
            };
        } else if (isDesktop) {
            return {
                margin: { top: 60, right: 40, bottom: 60, left: 80 },
                nodeWidth: { step: 250, tab: 220 },
                nodeHeight: { step: 100, tab: 80 },
                fontSize: { title: { step: '15px', tab: '13px' }, data: '10px' },
                spacing: { vertical: 120, horizontal: 200, child: 100 },
                expandButton: { size: 12, offset: 22 },
                maxDataEntries: 2,
                textLength: { label: 15, value: 20 },
            };
        } else {
            return {
                margin: { top: 70, right: 50, bottom: 70, left: 100 },
                nodeWidth: { step: 280, tab: 240 },
                nodeHeight: { step: 110, tab: 90 },
                fontSize: { title: { step: '16px', tab: '14px' }, data: '11px' },
                spacing: { vertical: 140, horizontal: 220, child: 120 },
                expandButton: { size: 14, offset: 25 },
                maxDataEntries: 3,
                textLength: { label: 18, value: 25 },
            };
        }
    }, []);

    // Build tree data structure
    const buildTreeData = (): TreeNode => {
        const root: TreeNode = {
            id: 'root',
            name: 'HR System',
            type: 'step',
            children: [],
        };

        treeStructure.forEach((step) => {
            const stepNode: TreeNode = {
                id: step.id,
                name: step.name,
                type: 'step',
                parent: 'root',
                data: getStepData(step.id),
                children: step.tabs.map((tab) => ({
                    id: `${step.id}-${tab.id}`,
                    name: tab.name,
                    type: 'tab',
                    parent: step.id,
                    data: getTabData(step.id, tab.id),
                })),
            };
            root.children!.push(stepNode);
        });

        return root;
    };

    const getStepData = (stepId: string): any => {
        switch (stepId) {
            case 'company':
                return {
                    name: hrSystemSnapshot.company.name,
                    industry: hrSystemSnapshot.company.industry,
                    size: hrSystemSnapshot.company.size,
                    philosophy: hrSystemSnapshot.ceo_philosophy.main_trait,
                };
            case 'diagnosis':
                return hrSystemSnapshot.diagnosis || {};
            case 'job_analysis':
                return {
                    jobs_defined: hrSystemSnapshot.job_architecture.jobs_defined,
                    structure_type: hrSystemSnapshot.job_architecture.structure_type,
                };
            case 'performance':
                return hrSystemSnapshot.performance_management;
            case 'compensation':
                return hrSystemSnapshot.compensation_benefits;
            case 'report':
                return { status: hrSystemSnapshot.hr_system_report.status };
            default:
                return {};
        }
    };

    const getTabData = (stepId: string, tabId: string): any => {
        return { stepId, tabId };
    };

    const formatValue = (value: any): string => {
        if (value === null || value === undefined || value === '') {
            return '-';
        }
        if (Array.isArray(value)) {
            return value.join(', ') || '-';
        }
        if (typeof value === 'object') {
            return JSON.stringify(value) || '-';
        }
        return String(value);
    };

    const getStepColor = (stepId: string): { fill: string; stroke: string; text: string } => {
        const colors: Record<string, { fill: string; stroke: string; text: string }> = {
            company: { fill: '#dbeafe', stroke: '#3b82f6', text: '#1e40af' },
            diagnosis: { fill: '#dcfce7', stroke: '#22c55e', text: '#166534' },
            job_analysis: { fill: '#f3e8ff', stroke: '#a855f7', text: '#6b21a8' },
            performance: { fill: '#fed7aa', stroke: '#f97316', text: '#9a3412' },
            compensation: { fill: '#e0e7ff', stroke: '#6366f1', text: '#3730a3' },
            hr_policy_os: { fill: '#ccfbf1', stroke: '#14b8a6', text: '#134e4a' },
            report: { fill: '#fce7f3', stroke: '#ec4899', text: '#9f1239' },
        };
        return colors[stepId] || { fill: '#f3f4f6', stroke: '#6b7280', text: '#374151' };
    };

    const toggleNode = (nodeId: string) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId);
        } else {
            newExpanded.add(nodeId);
        }
        setExpandedNodes(newExpanded);
    };

    useEffect(() => {
        if (!svgRef.current || !containerRef.current) return;

        const renderTree = () => {
            // Clear previous render
            d3.select(svgRef.current).selectAll('*').remove();

            const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;
            const containerHeight = containerRef.current?.offsetHeight || window.innerHeight;

            // Get responsive configuration
            const config = getResponsiveConfig(containerWidth, containerHeight);
            const { margin, spacing } = config;

            const width = containerWidth - margin.left - margin.right;
            const height = containerHeight - margin.top - margin.bottom;

            // Ensure minimum dimensions
            const minWidth = 300;
            const minHeight = 400;
            const finalWidth = Math.max(width, minWidth);
            const finalHeight = Math.max(height, minHeight);

            // Calculate SVG dimensions based on content - ensure it's scrollable
            const svgWidth = Math.max(containerWidth, finalWidth + margin.left + margin.right + 100);
            const svgHeight = Math.max(containerHeight, finalHeight + margin.top + margin.bottom + 100);

            const svg = d3
                .select(svgRef.current)
                .attr('width', svgWidth)
                .attr('height', svgHeight)
                .attr('viewBox', `0 0 ${svgWidth} ${svgHeight}`)
                .attr('preserveAspectRatio', 'none')
                .style('background', '#fafafa')
                .style('display', 'block');

            const g = svg
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            // Build tree data
            const rootData = buildTreeData();
            
            // Create horizontal tree layout
            const tree = d3.tree<TreeNode>()
                .size([finalHeight, finalWidth])
                .separation((a, b) => {
                    if (a.parent === b.parent) return 1;
                    return 2;
                });

            const root = d3.hierarchy(rootData);
            
            // Calculate layout
            tree(root as any);

            const nodes = root.descendants();
            const links = root.links();

            // Render nodes with responsive positioning
            nodes.forEach((d: any) => {
                if (d.depth === 0) {
                    // Root node - center vertically, left side
                    d.x = finalHeight / 2;
                    d.y = config.margin.left * 0.5;
                } else if (d.depth === 1) {
                    // First level children - horizontal row (responsive spacing)
                    const siblings = nodes.filter((n: any) => n.depth === 1);
                    const index = siblings.indexOf(d);
                    const totalSiblings = siblings.length;
                    const minSpacing = spacing.vertical;
                    const calculatedSpacing = finalHeight / (totalSiblings + 1);
                    const nodeSpacing = Math.max(minSpacing, calculatedSpacing);
                    d.x = nodeSpacing * (index + 1);
                    d.y = finalWidth * 0.3;
                } else {
                    // Deeper levels (tabs) - expand vertically below parent
                    const parent = d.parent;
                    const parentData = parent?.data as TreeNode;
                    const isParentExpanded = expandedNodes.has(parentData?.id || '');
                    
                    if (!isParentExpanded) {
                        d.x = parent?.x || 0;
                        d.y = parent?.y || 0;
                    } else {
                        const siblings = parent?.children?.filter((n: any) => n.depth === d.depth) || [];
                        const index = siblings.indexOf(d);
                        const childSpacing = spacing.child;
                        d.x = (parent?.x || 0) + (index - siblings.length / 2 + 0.5) * childSpacing;
                        d.y = (parent?.y || 0) + spacing.horizontal;
                    }
                }
            });

            // Filter visible nodes based on expansion
            const visibleNodes = nodes.filter((d: any) => {
                if (d.depth <= 1) return true;
                const parent = d.parent;
                const parentData = parent?.data as TreeNode;
                return expandedNodes.has(parentData?.id || '');
            });

            // Filter visible links
            const visibleLinks = links.filter((d: any) => {
                const targetData = d.target.data as TreeNode;
                if (d.target.depth <= 1) return true;
                const parent = d.target.parent;
                const parentData = parent?.data as TreeNode;
                return expandedNodes.has(parentData?.id || '');
            });

            // Draw/Update links
            const link = g.selectAll('path.link')
                .data(visibleLinks, (d: any) => `${d.source.data.id}-${d.target.data.id}`);

            const linkEnter = link.enter()
                .append('path')
                .attr('class', 'link')
                .attr('d', (d: any) => {
                    return `M ${d.source.y} ${d.source.x}
                            L ${d.target.y} ${d.target.x}`;
                })
                .style('fill', 'none')
                .style('stroke', '#9ca3af')
                .style('stroke-width', containerWidth < 768 ? 1.5 : 2)
                .style('opacity', 0);

            const linkUpdate = linkEnter.merge(link as any);
            
            linkUpdate
                .transition()
                .duration(500)
                .ease(d3.easeCubicInOut)
                .attr('d', (d: any) => {
                    return `M ${d.source.y} ${d.source.x}
                            L ${d.target.y} ${d.target.x}`;
                })
                .style('opacity', 0.6);

            link.exit<any>()
                .transition()
                .duration(500)
                .style('opacity', 0)
                .remove();

            // Draw/Update nodes
            const nodeGroup = g.selectAll('g.node')
                .data(visibleNodes, (d: any) => d.data.id);

            const nodeEnter = nodeGroup.enter()
                .append('g')
                .attr('class', 'node')
                .attr('transform', (d: any) => `translate(${d.y},${d.x})`)
                .style('cursor', 'pointer')
                .style('opacity', 0)
                .on('click', (event, d: any) => {
                    event.stopPropagation();
                    const nodeData = d.data as TreeNode;
                    setSelectedNode(nodeData);
                    if (nodeData.children && nodeData.children.length > 0) {
                        toggleNode(nodeData.id);
                    }
                });

            // Add node rectangles for new nodes only
            nodeEnter.each(function (d: any) {
                const nodeData = d.data as TreeNode;
                const isExpanded = expandedNodes.has(nodeData.id);
                const hasChildren = nodeData.children && nodeData.children.length > 0;
                const colors = nodeData.type === 'step' ? getStepColor(nodeData.id) : { fill: '#ffffff', stroke: '#e5e7eb', text: '#374151' };

                const group = d3.select(this);
                const nodeWidth = config.nodeWidth[nodeData.type];
                const nodeHeight = config.nodeHeight[nodeData.type];

                // Node rectangle
                group.append('rect')
                    .attr('rx', 10)
                    .attr('ry', 10)
                    .attr('width', nodeWidth)
                    .attr('height', nodeHeight)
                    .style('fill', colors.fill)
                    .style('stroke', colors.stroke)
                    .style('stroke-width', nodeData.type === 'step' ? 3 : 2)
                    .style('opacity', selectedNode?.id === nodeData.id ? 0.9 : 1);

                // Expand/collapse icon
                if (hasChildren) {
                    const expandX = nodeWidth - config.expandButton.offset;
                    const expandGroup = group.append('g')
                        .attr('class', 'expand-button')
                        .attr('transform', `translate(${expandX}, ${config.expandButton.size})`);

                    expandGroup.append('circle')
                        .attr('r', config.expandButton.size)
                        .style('fill', '#ffffff')
                        .style('stroke', '#6b7280')
                        .style('stroke-width', 2);

                    expandGroup.append('text')
                        .attr('class', 'expand-text')
                        .attr('x', 0)
                        .attr('y', config.expandButton.size * 0.3)
                        .attr('text-anchor', 'middle')
                        .attr('font-size', `${config.expandButton.size + 2}px`)
                        .attr('font-weight', 'bold')
                        .attr('fill', '#6b7280')
                        .text(isExpanded ? '−' : '+');
                }

                // Node title
                group.append('text')
                    .attr('x', 12)
                    .attr('y', containerWidth < 480 ? 18 : 25)
                    .attr('font-size', config.fontSize.title[nodeData.type])
                    .attr('font-weight', nodeData.type === 'step' ? 'bold' : '600')
                    .attr('fill', colors.text)
                    .text(nodeData.name);

                // Node data preview
                if (nodeData.data && typeof nodeData.data === 'object') {
                    const entries = Object.entries(nodeData.data).slice(0, config.maxDataEntries);
                    const lineHeight = containerWidth < 480 ? 12 : containerWidth < 768 ? 14 : 18;
                    const startY = containerWidth < 480 ? 32 : containerWidth < 768 ? 35 : 45;
                    
                    entries.forEach(([key, value], index) => {
                        if (value !== null && value !== undefined && value !== '') {
                            const label = key.replace(/_/g, ' ').substring(0, config.textLength.label);
                            const val = formatValue(value).substring(0, config.textLength.value);
                            group.append('text')
                                .attr('x', 12)
                                .attr('y', startY + index * lineHeight)
                                .attr('font-size', config.fontSize.data)
                                .attr('fill', '#6b7280')
                                .text(`${label}: ${val}`);
                        }
                    });
                }
            });

            // Update existing nodes
            const nodeUpdate = nodeEnter.merge(nodeGroup as any);

            nodeUpdate
                .transition()
                .duration(500)
                .ease(d3.easeCubicInOut)
                .attr('transform', (d: any) => `translate(${d.y},${d.x})`)
                .style('opacity', 1);

            // Update expand/collapse icons
            nodeUpdate.selectAll('text.expand-text')
                .text((d: any) => {
                    const nodeData = d.data as TreeNode;
                    return expandedNodes.has(nodeData.id) ? '−' : '+';
                });

            // Remove nodes that should be hidden
            const nodeExit = nodeGroup.exit<any>();

            nodeExit
                .transition()
                .duration(500)
                .style('opacity', 0)
                .remove();
        };

        renderTree();

        let resizeRaf = 0;
        const scheduleResize = () => {
            if (resizeRaf) cancelAnimationFrame(resizeRaf);
            resizeRaf = requestAnimationFrame(() => {
                resizeRaf = 0;
                if (containerRef.current && svgRef.current) {
                    renderTree();
                }
            });
        };

        if (containerRef.current) {
            resizeObserverRef.current = new ResizeObserver(() => {
                scheduleResize();
            });
            resizeObserverRef.current.observe(containerRef.current);
        }

        const handleResize = () => {
            scheduleResize();
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);

        return () => {
            if (resizeRaf) cancelAnimationFrame(resizeRaf);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
            if (resizeObserverRef.current && containerRef.current) {
                resizeObserverRef.current.unobserve(containerRef.current);
            }
        };
    }, [hrSystemSnapshot, expandedNodes, selectedNode, getResponsiveConfig, isMobile]);

    const renderNodeDetails = () => {
        if (!selectedNode) return null;

        const nodeData = selectedNode.data || {};
        const colors = selectedNode.type === 'step' ? getStepColor(selectedNode.id) : { fill: '#ffffff', stroke: '#e5e7eb', text: '#374151' };

        return (
            <Card className="h-full border-l-2" style={{ borderColor: colors.stroke }}>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl" style={{ color: colors.text }}>
                            {selectedNode.name}
                        </CardTitle>
                        <button
                            onClick={() => setSelectedNode(null)}
                            className="p-1 hover:bg-muted rounded"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </CardHeader>
                <CardContent className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                    <div className="space-y-4">
                        {nodeData && typeof nodeData === 'object' && Object.entries(nodeData).map(([key, value]) => {
                            if (value === null || value === undefined || value === '') return null;
                            
                            const label = key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
                            const formattedValue = formatValue(value);

                            return (
                                <div key={key} className="border-b pb-3">
                                    <div className="text-sm font-semibold text-muted-foreground mb-1">
                                        {label}
                                    </div>
                                    <div className="text-base">
                                        {formattedValue}
                                    </div>
                                </div>
                            );
                        })}
                        
                        {selectedNode.children && selectedNode.children.length > 0 && (
                            <div className="mt-6">
                                <div className="text-sm font-semibold text-muted-foreground mb-3">
                                    Children ({selectedNode.children.length})
                                </div>
                                <div className="space-y-2">
                                    {selectedNode.children.map((child) => (
                                        <div
                                            key={child.id}
                                            className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                                            onClick={() => setSelectedNode(child)}
                                        >
                                            <div className="font-medium">{child.name}</div>
                                            {child.data && typeof child.data === 'object' && (
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    {Object.keys(child.data).length} data fields
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="w-full h-full flex overflow-hidden">
            {/* Tree Container - Full Screen with proper scrolling */}
            <div 
                ref={containerRef} 
                className="flex-1 w-full h-full overflow-auto bg-white relative"
                style={{ 
                    overflowX: 'auto', 
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                <svg 
                    ref={svgRef} 
                    className="block"
                    style={{ 
                        minWidth: '100%', 
                        minHeight: '100%',
                        display: 'block'
                    }}
                ></svg>
            </div>

            {/* Details Panel - Responsive */}
            <div className={`${isMobile ? 'hidden' : 'hidden lg:block'} w-96 flex-shrink-0 border-l bg-background overflow-hidden`}>
                {selectedNode ? (
                    renderNodeDetails()
                ) : (
                    <div className="h-full flex items-center justify-center p-8">
                        <div className="text-center text-muted-foreground">
                            <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">Select a node to view details</p>
                            <p className="text-sm mt-2">Click on any node in the tree to see its information</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
