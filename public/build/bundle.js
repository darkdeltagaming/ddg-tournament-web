
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
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
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
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
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
    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }

    /* src/Background.svelte generated by Svelte v3.44.3 */
    const file$6 = "src/Background.svelte";

    // (21:4) {#if !blacken}
    function create_if_block$2(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			attr_dev(img, "class", "background svelte-zni3m7");
    			if (!src_url_equal(img.src, img_src_value = "/img/" + /*displayed*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "background");
    			add_location(img, file$6, 22, 12, 496);
    			add_location(div, file$6, 21, 8, 443);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*displayed*/ 1 && !src_url_equal(img.src, img_src_value = "/img/" + /*displayed*/ ctx[0])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 200 }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 200 }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(21:4) {#if !blacken}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div;
    	let current;
    	let if_block = !/*blacken*/ ctx[1] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "bg-container svelte-zni3m7");
    			add_location(div, file$6, 19, 0, 389);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*blacken*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*blacken*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
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
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Background', slots, []);
    	let { image = "csgo.png" } = $$props;
    	let displayed = image;
    	let blacken = false;

    	function cross(_) {
    		$$invalidate(1, blacken = true);

    		setTimeout(
    			() => {
    				$$invalidate(0, displayed = image);

    				setTimeout(
    					() => {
    						$$invalidate(1, blacken = false);
    					},
    					200
    				);
    			},
    			200
    		);
    	}

    	const writable_props = ['image'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Background> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('image' in $$props) $$invalidate(2, image = $$props.image);
    	};

    	$$self.$capture_state = () => ({ fade, image, displayed, blacken, cross });

    	$$self.$inject_state = $$props => {
    		if ('image' in $$props) $$invalidate(2, image = $$props.image);
    		if ('displayed' in $$props) $$invalidate(0, displayed = $$props.displayed);
    		if ('blacken' in $$props) $$invalidate(1, blacken = $$props.blacken);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*image*/ 4) {
    			cross();
    		}
    	};

    	return [displayed, blacken, image];
    }

    class Background extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { image: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Background",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get image() {
    		throw new Error("<Background>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set image(value) {
    		throw new Error("<Background>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Header.svelte generated by Svelte v3.44.3 */
    const file$5 = "src/Header.svelte";

    // (11:4) {#key state_name}
    function create_key_block(ctx) {
    	let h1;
    	let t_value = /*state_name*/ ctx[1].toUpperCase() + "";
    	let t;
    	let h1_intro;
    	let h1_outro;
    	let current;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t = text(t_value);
    			attr_dev(h1, "class", "svelte-1v2u9re");
    			add_location(h1, file$5, 11, 8, 264);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*state_name*/ 2) && t_value !== (t_value = /*state_name*/ ctx[1].toUpperCase() + "")) set_data_dev(t, t_value);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (h1_outro) h1_outro.end(1);
    				h1_intro = create_in_transition(h1, fade, { delay: 800 });
    				h1_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (h1_intro) h1_intro.invalidate();
    			h1_outro = create_out_transition(h1, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching && h1_outro) h1_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block.name,
    		type: "key",
    		source: "(11:4) {#key state_name}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div;
    	let h1;
    	let t0;
    	let t1;
    	let t2;
    	let img;
    	let img_src_value;
    	let t3;
    	let previous_key = /*state_name*/ ctx[1];
    	let current;
    	let key_block = create_key_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			t0 = text("MATCH #");
    			t1 = text(/*match_nr*/ ctx[0]);
    			t2 = space();
    			img = element("img");
    			t3 = space();
    			key_block.c();
    			attr_dev(h1, "class", "svelte-1v2u9re");
    			add_location(h1, file$5, 8, 4, 141);
    			if (!src_url_equal(img.src, img_src_value = "/favicon.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Dark Delta Gaming");
    			attr_dev(img, "class", "logo svelte-1v2u9re");
    			add_location(img, file$5, 9, 4, 172);
    			attr_dev(div, "class", "head svelte-1v2u9re");
    			add_location(div, file$5, 7, 0, 118);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(h1, t0);
    			append_dev(h1, t1);
    			append_dev(div, t2);
    			append_dev(div, img);
    			append_dev(div, t3);
    			key_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*match_nr*/ 1) set_data_dev(t1, /*match_nr*/ ctx[0]);

    			if (dirty & /*state_name*/ 2 && safe_not_equal(previous_key, previous_key = /*state_name*/ ctx[1])) {
    				group_outros();
    				transition_out(key_block, 1, 1, noop);
    				check_outros();
    				key_block = create_key_block(ctx);
    				key_block.c();
    				transition_in(key_block);
    				key_block.m(div, null);
    			} else {
    				key_block.p(ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(key_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(key_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			key_block.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
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

    	$$self.$capture_state = () => ({ fade, match_nr, state_name });

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
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { match_nr: 0, state_name: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$5.name
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

    /* src/maps/MapCard.svelte generated by Svelte v3.44.3 */
    const file$4 = "src/maps/MapCard.svelte";

    // (23:4) {#if banned}
    function create_if_block_1$1(ctx) {
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
    			add_location(path0, file$4, 25, 457, 1148);
    			attr_dev(g0, "fill", "#e63632");
    			attr_dev(g0, "stroke", "#e63632");
    			attr_dev(g0, "stroke-width", "16");
    			attr_dev(g0, "stroke-linejoin", "round");
    			add_location(g0, file$4, 25, 380, 1071);
    			attr_dev(path1, "d", "M0,172v-172h172v172z");
    			attr_dev(path1, "fill", "none");
    			attr_dev(path1, "stroke", "none");
    			attr_dev(path1, "stroke-width", "1");
    			attr_dev(path1, "stroke-linejoin", "miter");
    			add_location(path1, file$4, 25, 1401, 2092);
    			attr_dev(path2, "d", "M86,0c-22.97255,0 -44.56772,8.94715 -60.81031,25.18969c-16.24259,16.24253 -25.18969,37.84057 -25.18969,60.81031c0,22.96974 8.94715,44.56772 25.18969,60.81031c16.24253,16.24259 37.83776,25.18969 60.81031,25.18969c22.97255,0 44.56772,-8.94715 60.81031,-25.18969c16.24259,-16.24253 25.18969,-37.84057 25.18969,-60.81031c0,-22.96974 -8.94715,-44.56772 -25.18969,-60.81031c-16.24253,-16.24259 -37.83776,-25.18969 -60.81031,-25.18969zM33.29702,138.70298c-14.07579,-14.07854 -21.83035,-32.79587 -21.83035,-52.70298c0,-17.98002 6.37862,-34.95395 17.9744,-48.45165l105.01127,105.01127c-13.49558,11.59756 -30.46951,17.97371 -48.45234,17.97371c-19.90992,0 -38.62719,-7.75175 -52.70298,-21.83035zM142.55893,134.45165l-105.01127,-105.01127c13.49558,-11.59756 30.46951,-17.97371 48.45234,-17.97371c19.90992,0 38.62719,7.75175 52.70298,21.83035c14.07579,14.0786 21.83035,32.79587 21.83035,52.70298c0,17.98002 -6.37862,34.95395 -17.9744,48.45165z");
    			add_location(path2, file$4, 25, 1579, 2270);
    			attr_dev(g1, "fill", "#e63632");
    			attr_dev(g1, "stroke", "none");
    			attr_dev(g1, "stroke-width", "1");
    			attr_dev(g1, "stroke-linejoin", "miter");
    			add_location(g1, file$4, 25, 1506, 2197);
    			attr_dev(path3, "d", "");
    			attr_dev(path3, "fill", "none");
    			attr_dev(path3, "stroke", "none");
    			attr_dev(path3, "stroke-width", "1");
    			attr_dev(path3, "stroke-linejoin", "miter");
    			add_location(path3, file$4, 25, 2531, 3222);
    			attr_dev(path4, "d", "");
    			attr_dev(path4, "fill", "none");
    			attr_dev(path4, "stroke", "none");
    			attr_dev(path4, "stroke-width", "1");
    			attr_dev(path4, "stroke-linejoin", "miter");
    			add_location(path4, file$4, 25, 2616, 3307);
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
    			add_location(g2, file$4, 25, 96, 787);
    			attr_dev(g3, "transform", "translate(7.396,7.396) scale(0.914,0.914)");
    			add_location(g3, file$4, 25, 39, 730);
    			attr_dev(svg, "id", "overlay-icon");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "x", "0px");
    			attr_dev(svg, "y", "0px");
    			attr_dev(svg, "viewBox", "0 0 172 172");
    			set_style(svg, "fill", "#000000");
    			attr_dev(svg, "class", "svelte-y7cv2u");
    			add_location(svg, file$4, 23, 8, 587);
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
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(23:4) {#if banned}",
    		ctx
    	});

    	return block;
    }

    // (28:4) {#if picked}
    function create_if_block$1(ctx) {
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
    			add_location(path0, file$4, 30, 321, 3867);
    			attr_dev(path1, "d", "M69.56683,137.03383c-1.34017,1.34733 -3.16767,2.09983 -5.06683,2.09983c-1.89917,0 -3.72667,-0.7525 -5.06683,-2.09983l-40.463,-40.47017c-4.19967,-4.19967 -4.19967,-11.008 0,-15.2005l5.06683,-5.06683c4.19967,-4.19967 11.00083,-4.19967 15.2005,0l25.2625,25.2625l68.2625,-68.2625c4.19967,-4.19967 11.008,-4.19967 15.2005,0l5.06683,5.06683c4.19967,4.19967 4.19967,11.008 0,15.2005z");
    			add_location(path1, file$4, 30, 389, 3935);
    			attr_dev(g0, "fill", "#45b584");
    			add_location(g0, file$4, 30, 371, 3917);
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
    			add_location(g1, file$4, 30, 39, 3585);
    			attr_dev(svg, "id", "overlay-icon");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "x", "0px");
    			attr_dev(svg, "y", "0px");
    			attr_dev(svg, "viewBox", "0 0 172 172");
    			set_style(svg, "fill", "#000000");
    			attr_dev(svg, "class", "svelte-y7cv2u");
    			add_location(svg, file$4, 28, 8, 3442);
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
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(28:4) {#if picked}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let t1;
    	let t2;
    	let div1;
    	let p;
    	let t3_value = /*map_name*/ ctx[1].toUpperCase() + "";
    	let t3;
    	let div2_class_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*banned*/ ctx[2] && create_if_block_1$1(ctx);
    	let if_block1 = /*picked*/ ctx[0] && create_if_block$1(ctx);

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
    			attr_dev(div0, "class", "background svelte-y7cv2u");
    			add_location(div0, file$4, 21, 4, 531);
    			attr_dev(p, "class", "svelte-y7cv2u");
    			add_location(p, file$4, 33, 8, 4389);
    			attr_dev(div1, "class", "headline svelte-y7cv2u");
    			add_location(div1, file$4, 32, 4, 4358);

    			attr_dev(div2, "class", div2_class_value = "card " + (/*banned*/ ctx[2]
    			? 'banned'
    			: /*picked*/ ctx[0] ? 'picked' : '') + " svelte-y7cv2u");

    			set_style(div2, "--image", "url(/img/" + /*map_name*/ ctx[1] + ".png)");
    			add_location(div2, file$4, 20, 0, 397);
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
    				dispose = listen_dev(div2, "click", /*dispatchBan*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*banned*/ ctx[2]) {
    				if (if_block0) {
    					if (dirty & /*banned*/ 4) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div2, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*picked*/ ctx[0]) {
    				if (if_block1) {
    					if (dirty & /*picked*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div2, t2);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*map_name*/ 2 && t3_value !== (t3_value = /*map_name*/ ctx[1].toUpperCase() + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*banned, picked*/ 5 && div2_class_value !== (div2_class_value = "card " + (/*banned*/ ctx[2]
    			? 'banned'
    			: /*picked*/ ctx[0] ? 'picked' : '') + " svelte-y7cv2u")) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (dirty & /*map_name*/ 2) {
    				set_style(div2, "--image", "url(/img/" + /*map_name*/ ctx[1] + ".png)");
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MapCard', slots, []);
    	let { map_name } = $$props;
    	const dispatch = createEventDispatcher();
    	let { banned = false } = $$props;
    	let { picked = false } = $$props;

    	function dispatchBan() {
    		dispatch('ban', { name: map_name });
    	}

    	function pickMap() {
    		$$invalidate(0, picked = true);
    	}

    	const writable_props = ['map_name', 'banned', 'picked'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MapCard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('map_name' in $$props) $$invalidate(1, map_name = $$props.map_name);
    		if ('banned' in $$props) $$invalidate(2, banned = $$props.banned);
    		if ('picked' in $$props) $$invalidate(0, picked = $$props.picked);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		createEventDispatcher,
    		map_name,
    		dispatch,
    		banned,
    		picked,
    		dispatchBan,
    		pickMap
    	});

    	$$self.$inject_state = $$props => {
    		if ('map_name' in $$props) $$invalidate(1, map_name = $$props.map_name);
    		if ('banned' in $$props) $$invalidate(2, banned = $$props.banned);
    		if ('picked' in $$props) $$invalidate(0, picked = $$props.picked);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [picked, map_name, banned, dispatchBan, pickMap];
    }

    class MapCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			map_name: 1,
    			banned: 2,
    			picked: 0,
    			pickMap: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MapCard",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*map_name*/ ctx[1] === undefined && !('map_name' in props)) {
    			console.warn("<MapCard> was created without expected prop 'map_name'");
    		}
    	}

    	get map_name() {
    		throw new Error("<MapCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set map_name(value) {
    		throw new Error("<MapCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get banned() {
    		throw new Error("<MapCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set banned(value) {
    		throw new Error("<MapCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get picked() {
    		throw new Error("<MapCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set picked(value) {
    		throw new Error("<MapCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pickMap() {
    		return this.$$.ctx[4];
    	}

    	set pickMap(value) {
    		throw new Error("<MapCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/maps/Maps.svelte generated by Svelte v3.44.3 */
    const file$3 = "src/maps/Maps.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    // (40:8) {#each map_names as map_name, i}
    function create_each_block$2(ctx) {
    	let div;
    	let mapcard;
    	let t;
    	let div_intro;
    	let div_outro;
    	let current;

    	mapcard = new MapCard({
    			props: {
    				map_name: /*map_name*/ ctx[6],
    				banned: /*banning*/ ctx[0].indexOf(/*map_name*/ ctx[6]) < 0,
    				picked: /*banning*/ ctx[0].indexOf(/*map_name*/ ctx[6]) === 0 && /*isMapSelected*/ ctx[3]()
    			},
    			$$inline: true
    		});

    	mapcard.$on("ban", /*handleBan*/ ctx[2]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(mapcard.$$.fragment);
    			t = space();
    			add_location(div, file$3, 40, 12, 920);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(mapcard, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const mapcard_changes = {};
    			if (dirty & /*banning*/ 1) mapcard_changes.banned = /*banning*/ ctx[0].indexOf(/*map_name*/ ctx[6]) < 0;
    			if (dirty & /*banning*/ 1) mapcard_changes.picked = /*banning*/ ctx[0].indexOf(/*map_name*/ ctx[6]) === 0 && /*isMapSelected*/ ctx[3]();
    			mapcard.$set(mapcard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mapcard.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);

    				div_intro = create_in_transition(div, fly, {
    					delay: 1000 + 20 * /*i*/ ctx[8] * /*i*/ ctx[8],
    					y: 200,
    					duration: 1000
    				});

    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mapcard.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();

    			div_outro = create_out_transition(div, fly, {
    				delay: 20 * (4 - /*i*/ ctx[8]) * (4 - /*i*/ ctx[8]),
    				y: 200,
    				duration: 500
    			});

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(mapcard);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(40:8) {#each map_names as map_name, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div1;
    	let div0;
    	let current;
    	let each_value = /*map_names*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
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
    			add_location(div0, file$3, 38, 4, 846);
    			attr_dev(div1, "class", "wrapper svelte-qijldd");
    			add_location(div1, file$3, 37, 0, 820);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*map_names, banning, isMapSelected, handleBan*/ 15) {
    				each_value = /*map_names*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Maps', slots, []);
    	let map_names = ["vertigo", "inferno", "nuke", "lake", "chill"];
    	let banning = [...map_names];
    	let dispatch = createEventDispatcher();

    	function handleBan(event) {
    		let index = banning.indexOf(event.detail.name);

    		if (banning.length > 1 && index > -1) {
    			banning.splice(index, 1);
    		}

    		$$invalidate(0, banning);
    	}

    	function isMapSelected() {
    		return banning.length === 1;
    	}

    	function selectMap(map) {
    		if (isMapSelected()) {
    			dispatch('changeBackground', { img: map[0] + ".png" });
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Maps> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		MapCard,
    		fly,
    		createEventDispatcher,
    		map_names,
    		banning,
    		dispatch,
    		handleBan,
    		isMapSelected,
    		selectMap
    	});

    	$$self.$inject_state = $$props => {
    		if ('map_names' in $$props) $$invalidate(1, map_names = $$props.map_names);
    		if ('banning' in $$props) $$invalidate(0, banning = $$props.banning);
    		if ('dispatch' in $$props) dispatch = $$props.dispatch;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*banning*/ 1) {
    			selectMap(banning);
    		}
    	};

    	return [banning, map_names, handleBan, isMapSelected];
    }

    class Maps extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Maps",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/teams/TeamAnnouncement.svelte generated by Svelte v3.44.3 */
    const file$2 = "src/teams/TeamAnnouncement.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (13:12) {#each ct as member, i (member)}
    function create_each_block_1(key_1, ctx) {
    	let h1;
    	let t_1_value = /*member*/ ctx[2] + "";
    	let t_1;
    	let h1_transition;
    	let current;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			h1 = element("h1");
    			t_1 = text(t_1_value);
    			add_location(h1, file$2, 13, 16, 510);
    			this.first = h1;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t_1);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*ct*/ 1) && t_1_value !== (t_1_value = /*member*/ ctx[2] + "")) set_data_dev(t_1, t_1_value);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!h1_transition) h1_transition = create_bidirectional_transition(h1, scale, { delay: 1200 + 200 * /*i*/ ctx[4] }, true);
    				h1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!h1_transition) h1_transition = create_bidirectional_transition(h1, scale, { delay: 1200 + 200 * /*i*/ ctx[4] }, false);
    			h1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching && h1_transition) h1_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(13:12) {#each ct as member, i (member)}",
    		ctx
    	});

    	return block;
    }

    // (18:12) {#each t as member, i (member)}
    function create_each_block$1(key_1, ctx) {
    	let h1;
    	let t_1_value = /*member*/ ctx[2] + "";
    	let t_1;
    	let h1_transition;
    	let current;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			h1 = element("h1");
    			t_1 = text(t_1_value);
    			add_location(h1, file$2, 18, 12, 692);
    			this.first = h1;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t_1);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*t*/ 2) && t_1_value !== (t_1_value = /*member*/ ctx[2] + "")) set_data_dev(t_1, t_1_value);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!h1_transition) h1_transition = create_bidirectional_transition(h1, scale, { delay: 1900 + 200 * /*i*/ ctx[4] }, true);
    				h1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!h1_transition) h1_transition = create_bidirectional_transition(h1, scale, { delay: 1900 + 200 * /*i*/ ctx[4] }, false);
    			h1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching && h1_transition) h1_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(18:12) {#each t as member, i (member)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div3;
    	let div2;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let img1;
    	let img1_src_value;
    	let t1;
    	let div0;
    	let each_blocks_1 = [];
    	let each0_lookup = new Map();
    	let t2;
    	let div1;
    	let each_blocks = [];
    	let each1_lookup = new Map();
    	let div3_intro;
    	let div3_outro;
    	let current;
    	let each_value_1 = /*ct*/ ctx[0];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*member*/ ctx[2];
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_1[i] = create_each_block_1(key, child_ctx));
    	}

    	let each_value = /*t*/ ctx[1];
    	validate_each_argument(each_value);
    	const get_key_1 = ctx => /*member*/ ctx[2];
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key_1);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key_1(child_ctx);
    		each1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			img0 = element("img");
    			t0 = space();
    			img1 = element("img");
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(img0, "id", "ct-logo");
    			attr_dev(img0, "class", "logo svelte-yueif4");
    			if (!src_url_equal(img0.src, img0_src_value = "img/ct-icon.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "CT");
    			attr_dev(img0, "width", "128");
    			add_location(img0, file$2, 9, 8, 263);
    			attr_dev(img1, "id", "t-logo");
    			attr_dev(img1, "class", "logo svelte-yueif4");
    			if (!src_url_equal(img1.src, img1_src_value = "img/t-icon.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "CT");
    			attr_dev(img1, "width", "128");
    			add_location(img1, file$2, 10, 8, 346);
    			attr_dev(div0, "class", "info CT svelte-yueif4");
    			add_location(div0, file$2, 11, 8, 427);
    			attr_dev(div1, "class", "info T svelte-yueif4");
    			add_location(div1, file$2, 16, 8, 615);
    			attr_dev(div2, "class", "team-container svelte-yueif4");
    			add_location(div2, file$2, 8, 4, 226);
    			attr_dev(div3, "class", "teams svelte-yueif4");
    			add_location(div3, file$2, 7, 0, 151);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, img0);
    			append_dev(div2, t0);
    			append_dev(div2, img1);
    			append_dev(div2, t1);
    			append_dev(div2, div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append_dev(div2, t2);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*ct*/ 1) {
    				each_value_1 = /*ct*/ ctx[0];
    				validate_each_argument(each_value_1);
    				group_outros();
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_1, each0_lookup, div0, outro_and_destroy_block, create_each_block_1, null, get_each_context_1);
    				check_outros();
    			}

    			if (dirty & /*t*/ 2) {
    				each_value = /*t*/ ctx[1];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key_1);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx, each_value, each1_lookup, div1, outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			add_render_callback(() => {
    				if (div3_outro) div3_outro.end(1);
    				div3_intro = create_in_transition(div3, scale, { delay: 600 });
    				div3_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			if (div3_intro) div3_intro.invalidate();
    			div3_outro = create_out_transition(div3, scale, { delay: 200 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (detaching && div3_outro) div3_outro.end();
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
    	validate_slots('TeamAnnouncement', slots, []);
    	let { ct = ["Name #1", "Name #2"] } = $$props;
    	let { t = ["Name #3", "Name #4"] } = $$props;
    	const writable_props = ['ct', 't'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TeamAnnouncement> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('ct' in $$props) $$invalidate(0, ct = $$props.ct);
    		if ('t' in $$props) $$invalidate(1, t = $$props.t);
    	};

    	$$self.$capture_state = () => ({ scale, ct, t });

    	$$self.$inject_state = $$props => {
    		if ('ct' in $$props) $$invalidate(0, ct = $$props.ct);
    		if ('t' in $$props) $$invalidate(1, t = $$props.t);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [ct, t];
    }

    class TeamAnnouncement extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { ct: 0, t: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TeamAnnouncement",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get ct() {
    		throw new Error("<TeamAnnouncement>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ct(value) {
    		throw new Error("<TeamAnnouncement>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get t() {
    		throw new Error("<TeamAnnouncement>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set t(value) {
    		throw new Error("<TeamAnnouncement>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/leaderboard/Leaderboard.svelte generated by Svelte v3.44.3 */
    const file$1 = "src/leaderboard/Leaderboard.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	child_ctx[3] = i;
    	return child_ctx;
    }

    // (38:12) {#each leaderboard as item, i}
    function create_each_block(ctx) {
    	let div;
    	let p0;
    	let t0;
    	let t1_value = /*i*/ ctx[3] + 1 + "";
    	let t1;
    	let t2;
    	let p1;
    	let t3_value = /*item*/ ctx[1].name + "";
    	let t3;
    	let t4;
    	let p2;
    	let t5_value = /*item*/ ctx[1].points + "";
    	let t5;
    	let t6;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			t0 = text("#");
    			t1 = text(t1_value);
    			t2 = space();
    			p1 = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			p2 = element("p");
    			t5 = text(t5_value);
    			t6 = space();
    			attr_dev(p0, "class", "place");

    			set_style(p0, "color", /*i*/ ctx[3] == 0
    			? 'gold'
    			: /*i*/ ctx[3] == 1
    				? '#8a8a8a'
    				: /*i*/ ctx[3] == 2 ? 'chocolate' : 'white');

    			add_location(p0, file$1, 39, 20, 899);
    			add_location(p1, file$1, 40, 20, 1034);
    			add_location(p2, file$1, 41, 20, 1073);
    			attr_dev(div, "class", "row svelte-1whmmup");
    			add_location(div, file$1, 38, 16, 861);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(p0, t0);
    			append_dev(p0, t1);
    			append_dev(div, t2);
    			append_dev(div, p1);
    			append_dev(p1, t3);
    			append_dev(div, t4);
    			append_dev(div, p2);
    			append_dev(p2, t5);
    			append_dev(div, t6);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*leaderboard*/ 1 && t3_value !== (t3_value = /*item*/ ctx[1].name + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*leaderboard*/ 1 && t5_value !== (t5_value = /*item*/ ctx[1].points + "")) set_data_dev(t5, t5_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(38:12) {#each leaderboard as item, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div3;
    	let div2;
    	let h1;
    	let t1;
    	let div1;
    	let div0;
    	let p0;
    	let t3;
    	let p1;
    	let t5;
    	let p2;
    	let t7;
    	let div3_intro;
    	let div3_outro;
    	let current;
    	let each_value = /*leaderboard*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			h1 = element("h1");
    			h1.textContent = "LEADERBOARD";
    			t1 = space();
    			div1 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "Platz";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "Name";
    			t5 = space();
    			p2 = element("p");
    			p2.textContent = "Punkte";
    			t7 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "svelte-1whmmup");
    			add_location(h1, file$1, 30, 8, 609);
    			add_location(p0, file$1, 33, 16, 712);
    			add_location(p1, file$1, 34, 16, 741);
    			add_location(p2, file$1, 35, 16, 769);
    			attr_dev(div0, "class", "row title svelte-1whmmup");
    			add_location(div0, file$1, 32, 12, 672);
    			attr_dev(div1, "class", "content svelte-1whmmup");
    			add_location(div1, file$1, 31, 8, 638);
    			attr_dev(div2, "class", "leaderboard svelte-1whmmup");
    			add_location(div2, file$1, 29, 4, 575);
    			attr_dev(div3, "class", "container svelte-1whmmup");
    			add_location(div3, file$1, 28, 0, 510);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, h1);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t3);
    			append_dev(div0, p1);
    			append_dev(div0, t5);
    			append_dev(div0, p2);
    			append_dev(div1, t7);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*leaderboard*/ 1) {
    				each_value = /*leaderboard*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div3_outro) div3_outro.end(1);
    				div3_intro = create_in_transition(div3, scale, { delay: 1000 });
    				div3_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div3_intro) div3_intro.invalidate();
    			div3_outro = create_out_transition(div3, scale, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks, detaching);
    			if (detaching && div3_outro) div3_outro.end();
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
    	validate_slots('Leaderboard', slots, []);

    	let { leaderboard = [
    		{ "name": "NoRysq", "points": 39 },
    		{ "name": "DanL", "points": 35 },
    		{ "name": "Læffy", "points": 27 },
    		{ "name": "m1k3", "points": 19 },
    		{ "name": "JackyBreekie", "points": 9 }
    	] } = $$props;

    	const writable_props = ['leaderboard'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Leaderboard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('leaderboard' in $$props) $$invalidate(0, leaderboard = $$props.leaderboard);
    	};

    	$$self.$capture_state = () => ({ scale, leaderboard });

    	$$self.$inject_state = $$props => {
    		if ('leaderboard' in $$props) $$invalidate(0, leaderboard = $$props.leaderboard);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [leaderboard];
    }

    class Leaderboard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { leaderboard: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Leaderboard",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get leaderboard() {
    		throw new Error("<Leaderboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set leaderboard(value) {
    		throw new Error("<Leaderboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.44.3 */
    const file = "src/App.svelte";

    // (47:0) {#if state === 0}
    function create_if_block_2(ctx) {
    	let div;
    	let t_1;
    	let teamannouncement;
    	let current;
    	let mounted;
    	let dispose;

    	teamannouncement = new TeamAnnouncement({
    			props: { ct: /*ct*/ ctx[4], t: /*t*/ ctx[5] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			t_1 = space();
    			create_component(teamannouncement.$$.fragment);
    			add_location(div, file, 47, 0, 981);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t_1, anchor);
    			mount_component(teamannouncement, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "load", /*nextState*/ ctx[7](8000), false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(teamannouncement.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(teamannouncement.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t_1);
    			destroy_component(teamannouncement, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(47:0) {#if state === 0}",
    		ctx
    	});

    	return block;
    }

    // (51:0) {#if state === 1}
    function create_if_block_1(ctx) {
    	let maps;
    	let current;
    	maps = new Maps({ $$inline: true });
    	maps.$on("changeBackground", /*handleChangeBackground*/ ctx[6]);

    	const block = {
    		c: function create() {
    			create_component(maps.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(maps, target, anchor);
    			current = true;
    		},
    		p: noop,
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
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(51:0) {#if state === 1}",
    		ctx
    	});

    	return block;
    }

    // (54:0) {#if state === 2}
    function create_if_block(ctx) {
    	let leaderboard;
    	let current;
    	leaderboard = new Leaderboard({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(leaderboard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(leaderboard, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(leaderboard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(leaderboard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(leaderboard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(54:0) {#if state === 2}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let background;
    	let t0;
    	let header;
    	let t1;
    	let t2;
    	let t3;
    	let if_block2_anchor;
    	let current;

    	background = new Background({
    			props: { image: /*backgroundIMG*/ ctx[0] },
    			$$inline: true
    		});

    	header = new Header({
    			props: {
    				match_nr: /*match_nr*/ ctx[3],
    				state_name: /*state_name*/ ctx[2]
    			},
    			$$inline: true
    		});

    	let if_block0 = /*state*/ ctx[1] === 0 && create_if_block_2(ctx);
    	let if_block1 = /*state*/ ctx[1] === 1 && create_if_block_1(ctx);
    	let if_block2 = /*state*/ ctx[1] === 2 && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			create_component(background.$$.fragment);
    			t0 = space();
    			create_component(header.$$.fragment);
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(background, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(header, target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const background_changes = {};
    			if (dirty & /*backgroundIMG*/ 1) background_changes.image = /*backgroundIMG*/ ctx[0];
    			background.$set(background_changes);
    			const header_changes = {};
    			if (dirty & /*state_name*/ 4) header_changes.state_name = /*state_name*/ ctx[2];
    			header.$set(header_changes);

    			if (/*state*/ ctx[1] === 0) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*state*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t2.parentNode, t2);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*state*/ ctx[1] === 1) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*state*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t3.parentNode, t3);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*state*/ ctx[1] === 2) {
    				if (if_block2) {
    					if (dirty & /*state*/ 2) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(background.$$.fragment, local);
    			transition_in(header.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(background.$$.fragment, local);
    			transition_out(header.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(background, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
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
    	let backgroundIMG = "csgo.png";
    	let match_nr = 1;
    	let state = 0;
    	let state_name = getStateName();
    	let ct = ["NoRysq", "DanL"];
    	let t = ["Læffy", "m1k3"];

    	function getStateName() {
    		switch (state) {
    			case 0:
    				return "Announce Team";
    			case 1:
    				return "Ban Map";
    			case 2:
    				return "Leaderboard";
    			default:
    				return "";
    		}
    	}

    	function handleChangeBackground(event) {
    		setTimeout(
    			() => {
    				$$invalidate(0, backgroundIMG = event.detail.img);
    			},
    			500
    		);

    		nextState(3000);
    	}

    	function nextState(delay) {
    		setTimeout(
    			() => {
    				$$invalidate(1, state++, state);
    				$$invalidate(2, state_name = getStateName());
    			},
    			delay
    		);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Background,
    		Header,
    		Maps,
    		TeamAnnouncement,
    		Leaderboard,
    		backgroundIMG,
    		match_nr,
    		state,
    		state_name,
    		ct,
    		t,
    		getStateName,
    		handleChangeBackground,
    		nextState
    	});

    	$$self.$inject_state = $$props => {
    		if ('backgroundIMG' in $$props) $$invalidate(0, backgroundIMG = $$props.backgroundIMG);
    		if ('match_nr' in $$props) $$invalidate(3, match_nr = $$props.match_nr);
    		if ('state' in $$props) $$invalidate(1, state = $$props.state);
    		if ('state_name' in $$props) $$invalidate(2, state_name = $$props.state_name);
    		if ('ct' in $$props) $$invalidate(4, ct = $$props.ct);
    		if ('t' in $$props) $$invalidate(5, t = $$props.t);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		backgroundIMG,
    		state,
    		state_name,
    		match_nr,
    		ct,
    		t,
    		handleChangeBackground,
    		nextState
    	];
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
    	target: document.body,
    	intro: true
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
