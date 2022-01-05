
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.3' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Header.svelte generated by Svelte v3.44.3 */

    const file$2 = "src/Header.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let h10;
    	let t0;
    	let t1;
    	let t2;
    	let img;
    	let img_src_value;
    	let t3;
    	let h11;
    	let t4_value = /*state_name*/ ctx[1].toUpperCase() + "";
    	let t4;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h10 = element("h1");
    			t0 = text("MATCH #");
    			t1 = text(/*match_nr*/ ctx[0]);
    			t2 = space();
    			img = element("img");
    			t3 = space();
    			h11 = element("h1");
    			t4 = text(t4_value);
    			attr_dev(h10, "class", "svelte-ep9bxx");
    			add_location(h10, file$2, 6, 4, 95);
    			if (!src_url_equal(img.src, img_src_value = "/favicon.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Dark Delta Gaming");
    			attr_dev(img, "class", "logo svelte-ep9bxx");
    			add_location(img, file$2, 7, 4, 126);
    			attr_dev(h11, "class", "svelte-ep9bxx");
    			add_location(h11, file$2, 8, 4, 192);
    			attr_dev(div, "class", "head svelte-ep9bxx");
    			add_location(div, file$2, 5, 0, 72);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h10);
    			append_dev(h10, t0);
    			append_dev(h10, t1);
    			append_dev(div, t2);
    			append_dev(div, img);
    			append_dev(div, t3);
    			append_dev(div, h11);
    			append_dev(h11, t4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*match_nr*/ 1) set_data_dev(t1, /*match_nr*/ ctx[0]);
    			if (dirty & /*state_name*/ 2 && t4_value !== (t4_value = /*state_name*/ ctx[1].toUpperCase() + "")) set_data_dev(t4, t4_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	let { match_nr } = $$props;
    	let { state_name } = $$props;
    	const writable_props = ['match_nr', 'state_name'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('match_nr' in $$props) $$invalidate(0, match_nr = $$props.match_nr);
    		if ('state_name' in $$props) $$invalidate(1, state_name = $$props.state_name);
    	};

    	$$self.$capture_state = () => ({ match_nr, state_name });

    	$$self.$inject_state = $$props => {
    		if ('match_nr' in $$props) $$invalidate(0, match_nr = $$props.match_nr);
    		if ('state_name' in $$props) $$invalidate(1, state_name = $$props.state_name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [match_nr, state_name];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { match_nr: 0, state_name: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*match_nr*/ ctx[0] === undefined && !('match_nr' in props)) {
    			console.warn("<Header> was created without expected prop 'match_nr'");
    		}

    		if (/*state_name*/ ctx[1] === undefined && !('state_name' in props)) {
    			console.warn("<Header> was created without expected prop 'state_name'");
    		}
    	}

    	get match_nr() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set match_nr(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state_name() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state_name(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src/MapCard.svelte generated by Svelte v3.44.3 */
    const file$1 = "src/MapCard.svelte";

    // (15:4) {#if banned}
    function create_if_block_1(ctx) {
    	let svg;
    	let g3;
    	let g2;
    	let g0;
    	let path0;
    	let path1;
    	let g1;
    	let path2;
    	let path3;
    	let path4;
    	let svg_intro;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g3 = svg_element("g");
    			g2 = svg_element("g");
    			g0 = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			g1 = svg_element("g");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			attr_dev(path0, "d", "M146.81031,25.18969c16.24253,16.24259 25.18969,37.84057 25.18969,60.81031c0,22.96974 -8.9471,44.56778 -25.18969,60.81031c-16.24259,16.24253 -37.83776,25.18969 -60.81031,25.18969c-22.97255,0 -44.56778,-8.9471 -60.81031,-25.18969c-16.24253,-16.24259 -25.18969,-37.84057 -25.18969,-60.81031c0,-22.96974 8.9471,-44.56778 25.18969,-60.81031c16.24259,-16.24253 37.83776,-25.18969 60.81031,-25.18969c22.97255,0 44.56778,8.9471 60.81031,25.18969zM86,160.53333c17.98283,0 34.95676,-6.37615 48.45234,-17.97371l-105.01127,-105.01127c-11.59578,13.4977 -17.9744,30.47163 -17.9744,48.45165c0,19.90711 7.75456,38.62443 21.83035,52.70298c14.07579,14.0786 32.79306,21.83035 52.70298,21.83035zM160.53333,86c0,-19.90711 -7.75456,-38.62438 -21.83035,-52.70298c-14.07579,-14.0786 -32.79306,-21.83035 -52.70298,-21.83035c-17.98283,0 -34.95676,6.37615 -48.45234,17.97371l105.01127,105.01127c11.59578,-13.4977 17.9744,-30.47163 17.9744,-48.45165z");
    			add_location(path0, file$1, 17, 457, 947);
    			attr_dev(g0, "fill", "#e63632");
    			attr_dev(g0, "stroke", "#e63632");
    			attr_dev(g0, "stroke-width", "16");
    			attr_dev(g0, "stroke-linejoin", "round");
    			add_location(g0, file$1, 17, 380, 870);
    			attr_dev(path1, "d", "M0,172v-172h172v172z");
    			attr_dev(path1, "fill", "none");
    			attr_dev(path1, "stroke", "none");
    			attr_dev(path1, "stroke-width", "1");
    			attr_dev(path1, "stroke-linejoin", "miter");
    			add_location(path1, file$1, 17, 1401, 1891);
    			attr_dev(path2, "d", "M86,0c-22.97255,0 -44.56772,8.94715 -60.81031,25.18969c-16.24259,16.24253 -25.18969,37.84057 -25.18969,60.81031c0,22.96974 8.94715,44.56772 25.18969,60.81031c16.24253,16.24259 37.83776,25.18969 60.81031,25.18969c22.97255,0 44.56772,-8.94715 60.81031,-25.18969c16.24259,-16.24253 25.18969,-37.84057 25.18969,-60.81031c0,-22.96974 -8.94715,-44.56772 -25.18969,-60.81031c-16.24253,-16.24259 -37.83776,-25.18969 -60.81031,-25.18969zM33.29702,138.70298c-14.07579,-14.07854 -21.83035,-32.79587 -21.83035,-52.70298c0,-17.98002 6.37862,-34.95395 17.9744,-48.45165l105.01127,105.01127c-13.49558,11.59756 -30.46951,17.97371 -48.45234,17.97371c-19.90992,0 -38.62719,-7.75175 -52.70298,-21.83035zM142.55893,134.45165l-105.01127,-105.01127c13.49558,-11.59756 30.46951,-17.97371 48.45234,-17.97371c19.90992,0 38.62719,7.75175 52.70298,21.83035c14.07579,14.0786 21.83035,32.79587 21.83035,52.70298c0,17.98002 -6.37862,34.95395 -17.9744,48.45165z");
    			add_location(path2, file$1, 17, 1579, 2069);
    			attr_dev(g1, "fill", "#e63632");
    			attr_dev(g1, "stroke", "none");
    			attr_dev(g1, "stroke-width", "1");
    			attr_dev(g1, "stroke-linejoin", "miter");
    			add_location(g1, file$1, 17, 1506, 1996);
    			attr_dev(path3, "d", "");
    			attr_dev(path3, "fill", "none");
    			attr_dev(path3, "stroke", "none");
    			attr_dev(path3, "stroke-width", "1");
    			attr_dev(path3, "stroke-linejoin", "miter");
    			add_location(path3, file$1, 17, 2531, 3021);
    			attr_dev(path4, "d", "");
    			attr_dev(path4, "fill", "none");
    			attr_dev(path4, "stroke", "none");
    			attr_dev(path4, "stroke-width", "1");
    			attr_dev(path4, "stroke-linejoin", "miter");
    			add_location(path4, file$1, 17, 2616, 3106);
    			attr_dev(g2, "fill", "none");
    			attr_dev(g2, "fill-rule", "nonzero");
    			attr_dev(g2, "stroke", "none");
    			attr_dev(g2, "stroke-width", "none");
    			attr_dev(g2, "stroke-linecap", "butt");
    			attr_dev(g2, "stroke-linejoin", "none");
    			attr_dev(g2, "stroke-miterlimit", "10");
    			attr_dev(g2, "stroke-dasharray", "");
    			attr_dev(g2, "stroke-dashoffset", "0");
    			attr_dev(g2, "font-family", "none");
    			attr_dev(g2, "font-weight", "none");
    			attr_dev(g2, "font-size", "none");
    			attr_dev(g2, "text-anchor", "none");
    			set_style(g2, "mix-blend-mode", "normal");
    			add_location(g2, file$1, 17, 96, 586);
    			attr_dev(g3, "transform", "translate(7.396,7.396) scale(0.914,0.914)");
    			add_location(g3, file$1, 17, 39, 529);
    			attr_dev(svg, "id", "overlay-icon");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "x", "0px");
    			attr_dev(svg, "y", "0px");
    			attr_dev(svg, "viewBox", "0 0 172 172");
    			set_style(svg, "fill", "#000000");
    			attr_dev(svg, "class", "svelte-1uiajop");
    			add_location(svg, file$1, 15, 8, 386);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g3);
    			append_dev(g3, g2);
    			append_dev(g2, g0);
    			append_dev(g0, path0);
    			append_dev(g2, path1);
    			append_dev(g2, g1);
    			append_dev(g1, path2);
    			append_dev(g2, path3);
    			append_dev(g2, path4);
    		},
    		i: function intro(local) {
    			if (!svg_intro) {
    				add_render_callback(() => {
    					svg_intro = create_in_transition(svg, fade, {});
    					svg_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(15:4) {#if banned}",
    		ctx
    	});

    	return block;
    }

    // (20:4) {#if picked}
    function create_if_block$2(ctx) {
    	let svg;
    	let g1;
    	let path0;
    	let g0;
    	let path1;
    	let svg_intro;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g1 = svg_element("g");
    			path0 = svg_element("path");
    			g0 = svg_element("g");
    			path1 = svg_element("path");
    			attr_dev(path0, "d", "M0,172v-172h172v172z");
    			attr_dev(path0, "fill", "none");
    			add_location(path0, file$1, 22, 321, 3666);
    			attr_dev(path1, "d", "M69.56683,137.03383c-1.34017,1.34733 -3.16767,2.09983 -5.06683,2.09983c-1.89917,0 -3.72667,-0.7525 -5.06683,-2.09983l-40.463,-40.47017c-4.19967,-4.19967 -4.19967,-11.008 0,-15.2005l5.06683,-5.06683c4.19967,-4.19967 11.00083,-4.19967 15.2005,0l25.2625,25.2625l68.2625,-68.2625c4.19967,-4.19967 11.008,-4.19967 15.2005,0l5.06683,5.06683c4.19967,4.19967 4.19967,11.008 0,15.2005z");
    			add_location(path1, file$1, 22, 389, 3734);
    			attr_dev(g0, "fill", "#45b584");
    			add_location(g0, file$1, 22, 371, 3716);
    			attr_dev(g1, "fill", "none");
    			attr_dev(g1, "fill-rule", "nonzero");
    			attr_dev(g1, "stroke", "none");
    			attr_dev(g1, "stroke-width", "1");
    			attr_dev(g1, "stroke-linecap", "butt");
    			attr_dev(g1, "stroke-linejoin", "miter");
    			attr_dev(g1, "stroke-miterlimit", "10");
    			attr_dev(g1, "stroke-dasharray", "");
    			attr_dev(g1, "stroke-dashoffset", "0");
    			attr_dev(g1, "font-family", "none");
    			attr_dev(g1, "font-weight", "none");
    			attr_dev(g1, "font-size", "none");
    			attr_dev(g1, "text-anchor", "none");
    			set_style(g1, "mix-blend-mode", "normal");
    			add_location(g1, file$1, 22, 39, 3384);
    			attr_dev(svg, "id", "overlay-icon");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "x", "0px");
    			attr_dev(svg, "y", "0px");
    			attr_dev(svg, "viewBox", "0 0 172 172");
    			set_style(svg, "fill", "#000000");
    			attr_dev(svg, "class", "svelte-1uiajop");
    			add_location(svg, file$1, 20, 8, 3241);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g1);
    			append_dev(g1, path0);
    			append_dev(g1, g0);
    			append_dev(g0, path1);
    		},
    		i: function intro(local) {
    			if (!svg_intro) {
    				add_render_callback(() => {
    					svg_intro = create_in_transition(svg, fade, {});
    					svg_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(20:4) {#if picked}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let t1;
    	let t2;
    	let div1;
    	let p;
    	let t3_value = /*map_name*/ ctx[0].toUpperCase() + "";
    	let t3;
    	let div2_class_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*banned*/ ctx[1] && create_if_block_1(ctx);
    	let if_block1 = /*picked*/ ctx[2] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			div1 = element("div");
    			p = element("p");
    			t3 = text(t3_value);
    			attr_dev(div0, "class", "background svelte-1uiajop");
    			add_location(div0, file$1, 13, 4, 330);
    			attr_dev(p, "class", "svelte-1uiajop");
    			add_location(p, file$1, 25, 8, 4188);
    			attr_dev(div1, "class", "headline svelte-1uiajop");
    			add_location(div1, file$1, 24, 4, 4157);

    			attr_dev(div2, "class", div2_class_value = "card " + (/*banned*/ ctx[1]
    			? 'banned'
    			: /*picked*/ ctx[2] ? 'picked' : '') + " svelte-1uiajop");

    			set_style(div2, "--image", "url(/img/" + /*map_name*/ ctx[0] + ".png)");
    			add_location(div2, file$1, 12, 0, 193);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t0);
    			if (if_block0) if_block0.m(div2, null);
    			append_dev(div2, t1);
    			if (if_block1) if_block1.m(div2, null);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, p);
    			append_dev(p, t3);

    			if (!mounted) {
    				dispose = listen_dev(div2, "click", /*click_handler*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*banned*/ ctx[1]) {
    				if (if_block0) {
    					if (dirty & /*banned*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div2, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*map_name*/ 1 && t3_value !== (t3_value = /*map_name*/ ctx[0].toUpperCase() + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*banned*/ 2 && div2_class_value !== (div2_class_value = "card " + (/*banned*/ ctx[1]
    			? 'banned'
    			: /*picked*/ ctx[2] ? 'picked' : '') + " svelte-1uiajop")) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (dirty & /*map_name*/ 1) {
    				set_style(div2, "--image", "url(/img/" + /*map_name*/ ctx[0] + ".png)");
    			}
    		},
    		i: function intro(local) {
    			transition_in(if_block0);
    			transition_in(if_block1);
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MapCard', slots, []);
    	let { map_name } = $$props;
    	let banned = false;
    	let picked = false;

    	function banMap() {
    		$$invalidate(1, banned = true);
    	}

    	const writable_props = ['map_name'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MapCard> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => banMap();

    	$$self.$$set = $$props => {
    		if ('map_name' in $$props) $$invalidate(0, map_name = $$props.map_name);
    	};

    	$$self.$capture_state = () => ({ fade, map_name, banned, picked, banMap });

    	$$self.$inject_state = $$props => {
    		if ('map_name' in $$props) $$invalidate(0, map_name = $$props.map_name);
    		if ('banned' in $$props) $$invalidate(1, banned = $$props.banned);
    		if ('picked' in $$props) $$invalidate(2, picked = $$props.picked);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [map_name, banned, picked, banMap, click_handler];
    }

    class MapCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { map_name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MapCard",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*map_name*/ ctx[0] === undefined && !('map_name' in props)) {
    			console.warn("<MapCard> was created without expected prop 'map_name'");
    		}
    	}

    	get map_name() {
    		throw new Error("<MapCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set map_name(value) {
    		throw new Error("<MapCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Maps.svelte generated by Svelte v3.44.3 */
    const file = "src/Maps.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (18:0) {#if ready}
    function create_if_block$1(ctx) {
    	let div1;
    	let div0;
    	let current;
    	let each_value = /*map_names*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "holder svelte-qijldd");
    			add_location(div0, file, 19, 4, 357);
    			attr_dev(div1, "class", "wrapper svelte-qijldd");
    			add_location(div1, file, 18, 0, 331);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*map_names*/ 2) {
    				each_value = /*map_names*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(18:0) {#if ready}",
    		ctx
    	});

    	return block;
    }

    // (21:8) {#each map_names as map_name, i}
    function create_each_block(ctx) {
    	let div;
    	let mapcard;
    	let t;
    	let div_intro;
    	let current;

    	mapcard = new MapCard({
    			props: {
    				id: "map-card",
    				map_name: /*map_name*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(mapcard.$$.fragment);
    			t = space();
    			add_location(div, file, 21, 12, 431);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(mapcard, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mapcard.$$.fragment, local);

    			if (!div_intro) {
    				add_render_callback(() => {
    					div_intro = create_in_transition(div, fly, {
    						delay: 800 + 100 * /*i*/ ctx[4],
    						y: 200,
    						duration: 1000
    					});

    					div_intro.start();
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mapcard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(mapcard);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(21:8) {#each map_names as map_name, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*ready*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*ready*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*ready*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Maps', slots, []);
    	let map_names = ["vertigo", "inferno", "nuke", "lake", "chill"];
    	let ready = false;
    	onMount(() => $$invalidate(0, ready = true));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Maps> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ MapCard, fly, onMount, map_names, ready });

    	$$self.$inject_state = $$props => {
    		if ('map_names' in $$props) $$invalidate(1, map_names = $$props.map_names);
    		if ('ready' in $$props) $$invalidate(0, ready = $$props.ready);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [ready, map_names];
    }

    class Maps extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Maps",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.44.3 */

    // (10:0) {#if state_name === "Ban Maps"}
    function create_if_block(ctx) {
    	let maps;
    	let current;
    	maps = new Maps({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(maps.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(maps, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(maps.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(maps.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(maps, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(10:0) {#if state_name === \\\"Ban Maps\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let header;
    	let t;
    	let if_block_anchor;
    	let current;

    	header = new Header({
    			props: {
    				match_nr: /*match_nr*/ ctx[0],
    				state_name: /*state_name*/ ctx[1]
    			},
    			$$inline: true
    		});

    	let if_block = /*state_name*/ ctx[1] === "Ban Maps" && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let match_nr = 1;
    	let state_name = "Ban Maps";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ match_nr, state_name, Header, Maps });

    	$$self.$inject_state = $$props => {
    		if ('match_nr' in $$props) $$invalidate(0, match_nr = $$props.match_nr);
    		if ('state_name' in $$props) $$invalidate(1, state_name = $$props.state_name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [match_nr, state_name];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
