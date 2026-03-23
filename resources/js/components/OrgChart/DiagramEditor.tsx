import React, { useCallback, useState, useMemo } from 'react';
import type {
    Node,
    Edge,
    Connection,
    NodeTypes} from 'reactflow';
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import OrgNode from './OrgNode';
import { Plus, Save } from 'lucide-react';

interface DiagramNode extends Node {
    data: {
        label: string;
        orgUnitName: string;
        jobKeywordIds: number[];
        orgHead?: {
            name: string;
            rank: string;
            title: string;
            email: string;
        };
        jobSpecialists?: Array<{
            name: string;
            rank: string;
            title: string;
            email: string;
            job_keyword_id: number;
        }>;
    };
}

interface DiagramEditorProps {
    initialNodes?: DiagramNode[];
    initialEdges?: Edge[];
    onSave?: (nodes: DiagramNode[], edges: Edge[]) => void;
    onNodeUpdate?: (nodeId: string, data: Partial<DiagramNode['data']>) => void;
    jobDefinitions?: Array<{ id: number; job_name: string; job_keyword_id?: number }>;
    readOnly?: boolean;
}

const nodeTypes: NodeTypes = {
    orgNode: OrgNode,
};

export default function DiagramEditor({
    initialNodes = [],
    initialEdges = [],
    onSave,
    onNodeUpdate,
    jobDefinitions = [],
    readOnly = false,
}: DiagramEditorProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback(
        (params: Connection) => {
            setEdges((eds) => addEdge(params, eds));
        },
        [setEdges]
    );

    const addNode = useCallback(() => {
        const newNode: DiagramNode = {
            id: `node-${Date.now()}`,
            type: 'orgNode',
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            data: {
                label: 'New Organization',
                orgUnitName: 'New Organization',
                jobKeywordIds: [],
                jobDefinitions,
            },
        };
        setNodes((nds) => [...nds, newNode]);
    }, [setNodes, jobDefinitions]);

    const handleSave = useCallback(() => {
        if (onSave) {
            onSave(nodes as DiagramNode[], edges);
        }
    }, [nodes, edges, onSave]);

    const handleNodeDataChange = useCallback(
        (nodeId: string, data: Partial<DiagramNode['data']>) => {
            setNodes((nds) =>
                nds.map((node) =>
                    node.id === nodeId
                        ? { ...node, data: { ...node.data, ...data } }
                        : node
                )
            );
            if (onNodeUpdate) {
                onNodeUpdate(nodeId, data);
            }
        },
        [setNodes, onNodeUpdate]
    );

    // Update node types with handler
    const customNodeTypes = useMemo(() => {
        return {
            orgNode: (props: any) => (
                <OrgNode
                    {...props}
                    onDataChange={handleNodeDataChange}
                    readOnly={readOnly}
                />
            ),
        };
    }, [handleNodeDataChange, readOnly]);

    return (
        <div className="w-full h-[600px] border rounded-lg bg-white relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={customNodeTypes}
                onDrop={(event) => {
                    // Allow drops on the canvas - nodes will handle their own drops
                    event.preventDefault();
                }}
                onDragOver={(event) => {
                    // Allow drag over the canvas
                    event.preventDefault();
                    event.dataTransfer.dropEffect = 'move';
                }}
                fitView
                className="bg-gray-50"
            >
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                <Controls />
                <MiniMap />
            </ReactFlow>
            {!readOnly && (
                <div className="absolute bottom-4 left-4 flex gap-2 z-10">
                    <Button onClick={addNode} size="sm" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Node
                    </Button>
                    {onSave && (
                        <Button onClick={handleSave} size="sm">
                            <Save className="w-4 h-4 mr-2" />
                            Save Diagram
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
