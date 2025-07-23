"use client";

import {
	motion,
	type PanInfo,
	useMotionValue,
	useTransform,
} from "motion/react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface HandlebarsProps {
	children: React.ReactNode;
	minWidth?: number;
	maxWidth?: number;
	onRangeChange?: (left: number, right: number) => void;
}

export function Handlebars({
	children,
	minWidth = 50,
	maxWidth = 400,
	onRangeChange,
}: HandlebarsProps) {
	const [leftHandle, setLeftHandle] = useState(0);
	const [rightHandle, setRightHandle] = useState(maxWidth);
	const [contentWidth, setContentWidth] = useState(maxWidth);

	const leftHandleX = useMotionValue(0);
	const rightHandleX = useMotionValue(maxWidth);

	const visibleWidth = useTransform(
		[leftHandleX, rightHandleX],
		(values: number[]) => values[1] - values[0]
	);

	const contentLeft = useTransform(leftHandleX, (left: number) => -left);

	const containerRef = useRef<HTMLDivElement>(null);
	const measureRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!measureRef.current) return;

		const measureContent = () => {
			if (measureRef.current) {
				const width = measureRef.current.scrollWidth;
				const paddedWidth = width + 32;
				setContentWidth(paddedWidth);
				setRightHandle(paddedWidth);
				rightHandleX.set(paddedWidth);
			}
		};

		measureContent();
		const timer = setTimeout(measureContent, 50);

		return () => clearTimeout(timer);
	}, [children, rightHandleX]);

	useEffect(() => {
		leftHandleX.set(leftHandle);
	}, [leftHandle, leftHandleX]);

	useEffect(() => {
		rightHandleX.set(rightHandle);
	}, [rightHandle, rightHandleX]);

	useEffect(() => {
		onRangeChange?.(leftHandle, rightHandle);
	}, [leftHandle, rightHandle, onRangeChange]);

	const handleLeftDrag = (event: any, info: PanInfo) => {
		const newLeft = Math.max(
			0,
			Math.min(leftHandle + info.offset.x, rightHandle - minWidth)
		);
		setLeftHandle(newLeft);
	};

	const handleRightDrag = (event: any, info: PanInfo) => {
		const newRight = Math.max(
			leftHandle + minWidth,
			Math.min(contentWidth, rightHandle + info.offset.x)
		);
		setRightHandle(newRight);
	};

	return (
		<div className="mt-0 flex justify-center gap-4 leading-[4rem] md:mt-2">
			<div
				className="-left-[9999px] invisible absolute top-0 whitespace-nowrap px-4 font-[inherit]"
				ref={measureRef}
			>
				{children}
			</div>

			<div
				className="-rotate-[2.76deg] relative mt-2 max-w-[250px] md:max-w-[454px]"
				ref={containerRef}
				style={{ width: contentWidth }}
			>
				<div className="absolute inset-0 flex h-full w-full justify-between rounded-2xl border border-yellow-500">
					<motion.div
						className="flex h-full w-7 cursor-ew-resize select-none items-center justify-center rounded-full border border-yellow-500 bg-accent"
						drag="x"
						dragConstraints={{ left: 0, right: rightHandle - minWidth }}
						dragElastic={0}
						dragMomentum={false}
						onDrag={handleLeftDrag}
						style={{
							position: "absolute",
							x: leftHandleX,
							left: 0,
							zIndex: 10,
						}}
						transition={{ type: "spring", stiffness: 400, damping: 30 }}
						whileDrag={{ scale: 1.1 }}
						whileHover={{ scale: 1.05 }}
					>
						<div className="h-8 w-2 rounded-full bg-yellow-500" />
					</motion.div>

					<motion.div
						className="flex h-full w-7 cursor-ew-resize select-none items-center justify-center rounded-full border border-yellow-500 bg-accent"
						drag="x"
						dragConstraints={{
							left: leftHandle + minWidth,
							right: contentWidth,
						}}
						dragElastic={0}
						dragMomentum={false}
						onDrag={handleRightDrag}
						style={{
							position: "absolute",
							x: rightHandleX,
							left: -30,
							zIndex: 10,
						}}
						transition={{ type: "spring", stiffness: 400, damping: 30 }}
						whileDrag={{ scale: 1.1 }}
						whileHover={{ scale: 1.05 }}
					>
						<div className="h-8 w-2 rounded-full bg-yellow-500" />
					</motion.div>
				</div>

				<motion.div
					className="relative overflow-hidden rounded-2xl"
					style={{
						width: visibleWidth,
						x: leftHandleX,
						height: "100%",
					}}
				>
					<motion.div
						className="flex h-full w-full items-center justify-center px-4"
						style={{
							x: contentLeft,
							width: contentWidth,
							whiteSpace: "nowrap",
						}}
					>
						{children}
					</motion.div>
				</motion.div>
			</div>
		</div>
	);
}
